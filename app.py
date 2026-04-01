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
    """ Menghasilkan ringkasan murni sepanjang 4-6 kalimat (Topik terbanyak) """
    sentences = get_sentences(text)
    keywords = get_keywords(text, 15)
    
    if not sentences: 
        return "Teks tidak mencukupi untuk dibuat ringkasan otomatis."
    
    scored_sentences = []
    for s in sentences:
        score = sum(1 for kw in keywords if kw in s.lower())
        scored_sentences.append((score, s))
        
    scored_sentences.sort(key=lambda x: x[0], reverse=True)
    # Pilih 4 hingga 6 kalimat terbaik
    num_sentences = min(6, max(4, len(sentences)//3))
    top_sentences = [s for score, s in scored_sentences[:num_sentences]]
    
    # Sambungkan balik berdasarkan urutan alur asli
    original_order = [s for s in sentences if s in top_sentences]
    return " ".join(original_order)

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
    if 'pdf' not in request.files:
        return jsonify({"error": "Tidak ada file PDF yang dikirim"}), 400
    
    file = request.files['pdf']
    options_raw = request.form.get('options', '{}')
    
    if file.filename == '':
        return jsonify({"error": "Nama file kosong"}), 400

    if not file.filename.lower().endswith('.pdf'):
        return jsonify({"error": "Hanya menerima file PDF"}), 400

    try:
        # 1. Ekstrasi Teks Riil
        text, num_pages = extract_text_from_pdf(file)
        word_count = len(text.split())
        
        # Guard apabila PDF merupakan Image/Scan (tidak ada Text Layer)
        if word_count < 10:
             return jsonify({
                 "summary": "Gagal. Dokumen terlalu pendek atau berformat gambar scan seutuhnya (PDF Image).",
                 "slides": [], "quiz": [], "discussion": [],
                 "metadata": {"wordCount": word_count, "pageCount": num_pages, "topic": "Unknown", "processedAt": "Sekarang"}
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
        return jsonify({
            "summary": summary_result,
            "slides": slides_result,
            "quiz": quiz_result,
            "discussion": discussion_result,
            "metadata": {
                "wordCount": word_count,
                "pageCount": num_pages,
                "topic": topic_title,
                "processedAt": "Sukses"
            }
        })
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
