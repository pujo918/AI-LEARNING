import re
import json
import random
from collections import Counter
from flask import Flask, request, jsonify
from flask_cors import CORS
import PyPDF2

app = Flask(__name__)
# Enable CORS for Next.js frontend running on localhost:3000
CORS(app)

# Daftar stop words sederhana untuk mengecualikan kata hubung/umum
STOP_WORDS = set([
    "yang", "di", "ke", "dari", "pada", "dalam", "untuk", "dengan", "dan", "atau", "ini",
    "itu", "juga", "sudah", "akan", "dapat", "bisa", "adalah", "sebagai", "oleh", "karena",
    "sehingga", "bahwa", "hal", "secara", "tidak", "ada", "seperti", "sangat", "lebih",
    "bagi", "saat", "setelah", "namun", "tetapi", "menjadi", "merupakan", "kita", "kamu", 
    "saya", "mereka", "kami", "anda", "dia", "ia", "the", "of", "and", "a", "to", "in", 
    "is", "you", "that", "it", "he", "was", "for", "on", "are", "as", "with", "his", "they", 
    "i", "at", "be", "this", "have", "from", "or", "one", "had", "by", "word", "but", "not",
    "what", "all", "were", "we", "when", "your", "can", "said", "there", "use", "an", "each"
])

def clean_text_preserve_paragraphs(text: str) -> str:
    """ Bersihkan teks tapi pertahankan batas paragraf (\n\n) """
    text = re.sub(r'\[.*?\]', '', text)
    # Ganti single newline dengan spasi (untuk menyatukan kalimat pecah baris)
    text = re.sub(r'(?<!\n)\n(?!\n)', ' ', text)
    # Ganti newline yang lebih dari 2 dengan \n\n (format paragraf)
    text = re.sub(r'\n{2,}', '\n\n', text)
    text = re.sub(r'[ \t]+', ' ', text)
    return text.strip()

def extract_text_from_pdf(file) -> tuple[str, int]:
    """ Ekstraksi teks murni dari PDF sembari tetap mengamankan newline paragraf """
    reader = PyPDF2.PdfReader(file)
    text_content = ""
    for page in reader.pages:
        extracted = page.extract_text()
        if extracted:
            text_content += str(extracted) + "\n\n"
    return clean_text_preserve_paragraphs(text_content), len(reader.pages)

def get_sentences(text: str) -> list:
    """ Membagi teks menjadi kalimat, membuang yang amat pendek """
    sentences = re.split(r'(?<=[.!?])\s+', text)
    return [s.strip() for s in sentences if len(s.strip().split()) >= 5]

def get_keywords(text: str, num: int = 10) -> list:
    """ Mengekstrak kata kunci berfrekuensi paling tinggi """
    words = re.findall(r'\b[a-zA-Z]{4,}\b', text.lower())
    filtered_words = [w for w in words if w not in STOP_WORDS]
    counts = Counter(filtered_words)
    return [word for word, count in counts.most_common(num)]

def generate_summary(text: str) -> str:
    """ Menghasilkan ringkasan komprehensif terstruktur (Awal, Poin Tengah, Akhir) """
    sentences = get_sentences(text)
    keywords = get_keywords(text, 20)
    
    if len(sentences) < 5: 
        return "Teks terlalu pendek untuk dibuat ringkasan terstruktur. Cobalah mengunggah dokumen yang lebih panjang."
    
    # Fungsi pembantu untuk menilai kalimat
    def score_sentence(sentence):
        # 1. Skor dari jumlah kata kunci
        kw_score = sum(3 for kw in keywords[:5] if kw in sentence.lower()) + sum(1 for kw in keywords[5:] if kw in sentence.lower())
        
        # 2. Penalti jika terlalu pendek atau terlalu panjang
        word_count = len(sentence.split())
        length_penalty = 0
        if word_count < 8: length_penalty = -10
        elif word_count > 45: length_penalty = -5
        
        return kw_score + length_penalty

    # Membagi kalimat menjadi 3 area: 20% Awal, 60% Tengah, 20% Akhir
    intro_end = max(1, int(len(sentences) * 0.2))
    concl_start = max(intro_end + 1, int(len(sentences) * 0.8))
    
    intro_sentences = sentences[:intro_end]
    body_sentences = sentences[intro_end:concl_start]
    conclusion_sentences = sentences[concl_start:]
    
    if not body_sentences:
        body_sentences = sentences
        
    # 1. Pilih kalimat Pendahuluan terbaik
    intro_scored = [(score_sentence(s), s) for s in intro_sentences]
    intro_best = sorted(intro_scored, key=lambda x: x[0], reverse=True)[0][1] if intro_scored else ""
    
    # 2. Pilih poin utama secara dinamis menyesuaikan panjang dokumen (1 poin per 8 kalimat, max 10, min 3)
    num_body_sentences = min(10, max(3, len(sentences) // 8))
    
    body_scored = [(score_sentence(s), s) for s in body_sentences]
    body_best = [s for score, s in sorted(body_scored, key=lambda x: x[0], reverse=True)[:num_body_sentences]]
    body_best = [s for s in body_sentences if s in body_best] # Kembalikan ke urutan kronologis
    
    # 3. Pilih kalimat Kesimpulan terbaik
    concl_scored = [(score_sentence(s), s) for s in conclusion_sentences]
    concl_best = sorted(concl_scored, key=lambda x: x[0], reverse=True)[0][1] if concl_scored else ""
    
    # Menyusun format output
    summary_parts = []
    if intro_best:
        summary_parts.append(f"📌 PENGANTAR:\n{intro_best}")
    if body_best:
        body_bullets = "\n".join([f"• {s}" for s in body_best])
        summary_parts.append(f"💡 POIN UTAMA:\n{body_bullets}")
    if concl_best:
        summary_parts.append(f"🎯 KESIMPULAN:\n{concl_best}")
        
    return "\n\n".join(summary_parts)

def generate_slides(text):
    """ Membuat Slide Terstruktur: 1 Paragraf -> Judul (Kalimat 1) & Bullets (Kalimat 2-5) """
    global_keywords = get_keywords(text, 10)
    # Deteksi topik per paragraf
    paragraphs = [p.strip() for p in text.split('\n\n') if len(p.strip()) > 50]
    
    # Fallback: jika PDF tak punya format paragraf yang rapi (semua 1 spasi berdekatan)
    if len(paragraphs) < 3:
        sentences = get_sentences(text)
        paragraphs = []
        for i in range(0, len(sentences), 5):
            paragraphs.append(" ".join(sentences[i:i+5]))
    
    if not paragraphs: return []

    # Memilah 5 paragraf terbaik yang paling banyak mengandung keywords
    scored_paras = []
    for p in paragraphs:
        score = sum(1 for kw in global_keywords if kw in p.lower())
        scored_paras.append((score, p))
        
    scored_paras.sort(key=lambda x: x[0], reverse=True)
    top_paras = [p for score, p in scored_paras[:5]]
    
    # Mengembalikan paragraf ke urutan baca yang logis (Kronologis)
    best_paragraphs = [p for p in paragraphs if p in top_paras]
    
    slides = []
    for para in best_paragraphs:
        sentences = re.split(r'(?<=[.!?])\s+', para)
        # Menghapus anomali baca dan kalimat yang sangat pendek < 30 char
        valid_sentences = [re.sub(r'[^a-zA-Z0-9\s.,!?()-]', '', s.strip()) for s in sentences]
        valid_sentences = [s for s in valid_sentences if len(s) >= 30]
        
        # Paragraf harus memiliki setidaknya judul (kalimat 1) dan min 1 poin
        if len(valid_sentences) < 2:
            continue
            
        # Ambil Kalimat Pertama sebagai Judul
        first_sent = valid_sentences[0]
        words = first_sent.split()
        
        # Pangkas maks 10 kata agar 'Slide Friendly'
        title_words = words[:10]
        title = " ".join(title_words).title()
        if len(words) > 10:
            title += "..."
            
        # Ambil sisa kalimat (2-4 poin) untuk bullet-points (saling terkait per Topik)
        points = valid_sentences[1:5]
        
        slides.append({
            "slideNumber": len(slides) + 1,
            "title": title,
            "bullets": points
        })
        
        # Batasan Max 5 Slides
        if len(slides) >= 5:
            break
            
    return slides

def generate_quiz(text):
    """ Generate 3-5 Soal otomatis format Jawaban Ganda """
    sentences = get_sentences(text)
    keywords = get_keywords(text, 10)
    
    if not keywords or not sentences: return []
    
    quiz = []
    pool = sentences.copy()
    random.shuffle(pool) # Acak pencarian kalimat
    
    num_questions = min(5, max(3, len(keywords)))
    
    for i, kw in enumerate(keywords[:num_questions]):
        # Cari kalimat yang mengandung target keyword tsb
        relevant_sentence = next((s for s in pool if kw in s.lower() and len(s) > 40), None)
        if not relevant_sentence: continue
        
        question = f"Apa yang dilandaskan terkait dengan unsur '{kw}' berdasarkan isi materi dokumen?"
        
        # Opsi Benar (Kalimat asli dokumen sebagai jawaban pasti)
        correct_answer = relevant_sentence[:150] + "..." if len(relevant_sentence) > 150 else relevant_sentence
        
        # Opsi Palsu
        fake1 = f"Istilah '{kw.capitalize()}' tidak berdampak pada ekosistem inti karena berlawanan konsep."
        fake2 = f"Elemen pendukungnya sama sekali tidak dapat diterapkan bersama."
        fake3 = f"Penerapan praktis tentang entitas itu belum disinggung hingga akhir bab pembahasan."
        
        options = [correct_answer, fake1, fake2, fake3]
        shuffled_options = options.copy()
        random.shuffle(shuffled_options)
        
        correct_index = shuffled_options.index(correct_answer)
        
        quiz.append({
            "id": len(quiz) + 1,
            "question": question,
            "options": shuffled_options,
            "correctAnswer": correct_index,
            "explanation": f"Mengacu pada konsep sesungguhnya di teks: '{relevant_sentence}'"
        })
        
    return quiz

def generate_discussion(text):
    """ Generate studi kasus/diskusi berdasarkan kata kunci inti """
    keywords = get_keywords(text, 5)
    if len(keywords) < 2: return ["Apa wawasan utama yang dapat digarisbawahi dari buku/artikel ini?"]
    
    # Membuat 2-3 pertanyaan kontekstual bebas
    return [
        f"Menganalisis narasi pada dokumen, mampukah Anda mengabstraksikan fungsi spesifik '{keywords[0]}' dalam masalah sebenarnya?",
        f"Terdapat dinamika antara '{keywords[1]}' dengan elemen dasar '{keywords[2] if len(keywords)>2 else keywords[0]}'. Apa dampak nyatanya?",
        f"Jika metode '{keywords[0]}' wajib diimplementasikan saat ini, jelaskan apa celah atau keuntungan terbesarnya!"
    ][:3]


@app.route('/api/process-pdf', methods=['POST'])
def process_pdf():
    print("--- Received PDF Processing Request ---")
    if 'pdf' not in request.files:
        print("Error: No 'pdf' file in request.files")
        return jsonify({"error": "Tidak ada file PDF yang dikirim. Pastikan field name adalah 'pdf'."}), 400
    
    file = request.files['pdf']
    options_raw = request.form.get('options', '{}')
    
    if file.filename == '':
        print("Error: Empty filename")
        return jsonify({"error": "Nama file kosong"}), 400

    if not file.filename.lower().endswith('.pdf'):
        print(f"Error: Invalid file type ({file.filename})")
        return jsonify({"error": "Hanya menerima file PDF"}), 400

    print(f"File Name: {file.filename}")
    print(f"Options: {options_raw}")

    try:
        # Ensure we're at the start of the file
        file.seek(0)
        
        # 1. Ekstrasi Teks Riil
        text, num_pages = extract_text_from_pdf(file)
        word_count = len(text.split())
        
        print(f"Extracted: {num_pages} pages, {word_count} words")
        
        # Guard apabila PDF merupakan Image/Scan (tidak ada Text Layer)
        if word_count < 10:
             print("Warning: Content too short or scanned (word_count < 10)")
             return jsonify({
                 "summary": "Mohon maaf, sistem gagal mendeteksi teks dalam dokumen ini. Kemungkinan dokumen Anda adalah hasil scan (berbentuk gambar) atau terlalu pendek. Sistem ini memerlukan teks asli (copyable) agar bisa diringkas.",
                 "slides": [], "quiz": [], "discussion": [],
                 "metadata": {"wordCount": word_count, "pageCount": num_pages, "topic": "Unknown", "processedAt": "Gagal (Teks Kosong)"}
             })
        
        # 2. Ambil preferensi opsi client 
        options = json.loads(options_raw) if options_raw else {}

        # 3. Proses secara parsial lewat modul cerdas di atas
        summary_result = generate_summary(text) if options.get('summary', True) else ""
        slides_result = generate_slides(text) if options.get('slides', True) else []
        quiz_result = generate_quiz(text) if options.get('quiz', True) else []
        discussion_result = generate_discussion(text) if options.get('discussion', True) else []
        
        # Metadata ringkas
        keywords = get_keywords(text, 3)
        topic_title = ", ".join(keywords).title() if keywords else "Dokumen Umum"
        
        # 4. Return Output persis seperti skema Frontend `ResultTabs.tsx`
        print("Success: Generated results sent back to client")
        return jsonify({
            "summary": summary_result,
            "slides": slides_result,
            "quiz": quiz_result,
            "discussion": discussion_result,
            "metadata": {
                "wordCount": word_count,
                "pageCount": num_pages,
                "topic": topic_title,
                "processedAt": "Sukses pada " + str(random.randint(10, 59)) + " detik terakhir" # Mocking time
            }
        })
    except Exception as e:
        import traceback
        traceback.print_exc()
        print(f"Exception during processing: {str(e)}")
        return jsonify({"error": f"Kesalahan Sistem: {str(e)}"}), 500

if __name__ == '__main__':
    print("AI Learning Backend running on port 5000...")
    app.run(host='0.0.0.0', port=5000, debug=True)
