import React, { useState } from 'react';
import axios from 'axios';

interface OcrResult {
  extractedAnswer: string;
  score: number;
  feedback: string;
  confidence: number;
}

const OcrUpload: React.FC = () => {
  const [answerImage, setAnswerImage] = useState<File | null>(null);
  const [markingPdf, setMarkingPdf] = useState<File | null>(null);
  const [result, setResult] = useState<OcrResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAnswerUpload = async () => {
    if (!answerImage) return;
    
    const formData = new FormData();
    formData.append('answerImage', answerImage);
    
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:3001/api/ocr-answer', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setResult(res.data);
    } catch (error) {
      console.error('OCR 上傳失敗:', error);
    }
    setLoading(false);
  };

  return (
    <div style={{
      padding: '40px',
      border: '3px dashed #3b82f6',
      borderRadius: '20px',
      background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
      textAlign: 'center'
    }}>
      <h2 style={{ color: '#1e40af', marginBottom: '32px' }}>
        📸 Past Paper OCR 批改
      </h2>
      
      {/* 學生答案上傳 */}
      <div style={{ marginBottom: '32px' }}>
        <input 
          type="file" 
          accept="image/*"
          onChange={(e) => setAnswerImage(e.target.files?.[0] || null)}
          style={{
            display: 'none'
          }}
          id="answerImage"
        />
        <label htmlFor="answerImage" style={{
          display: 'inline-block',
          padding: '20px 40px',
          background: 'linear-gradient(45deg, #3b82f6, #1d4ed8)',
          color: 'white',
          borderRadius: '16px',
          cursor: 'pointer',
          fontSize: '18px',
          fontWeight: '600'
        }}>
          📁 上傳學生手寫答案
        </label>
        {answerImage && (
          <p style={{ marginTop: '12px', color: '#059669' }}>
            ✅ 已選擇: {answerImage.name}
          </p>
        )}
      </div>

      <button
        onClick={handleAnswerUpload}
        disabled={!answerImage || loading}
        style={{
          padding: '16px 32px',
          background: loading ? '#9ca3af' : '#10b981',
          color: 'white',
          border: 'none',
          borderRadius: '12px',
          fontSize: '18px',
          cursor: loading ? 'not-allowed' : 'pointer',
          marginBottom: '32px'
        }}
      >
        {loading ? '🔍 OCR 識別中...' : '🚀 開始批改'}
      </button>

      {/* 批改結果 */}
      {result && (
        <div style={{
          marginTop: '32px',
          padding: '32px',
          background: 'white',
          borderRadius: '20px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
          border: `4px solid ${result.score > 80 ? '#10b981' : '#f59e0b'}`
        }}>
          <h3 style={{ 
            color: result.score > 80 ? '#059669' : '#d97706',
            fontSize: '24px',
            marginBottom: '20px'
          }}>
            分數：{result.score}分
          </h3>
          <p style={{ fontSize: '18px', lineHeight: '1.6' }}>
            <strong>識別答案：</strong>{result.extractedAnswer}
          </p>
          <p style={{ fontSize: '18px', lineHeight: '1.6', color: '#1e293b' }}>
            {result.feedback}
          </p>
          <div style={{
            marginTop: '20px',
            padding: '20px',
            background: '#f8fafc',
            borderRadius: '12px',
            fontSize: '16px'
          }}>
            信心分數：{result.confidence}%
          </div>
        </div>
      )}
    </div>
  );
};

export default OcrUpload;
