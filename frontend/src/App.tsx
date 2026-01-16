import React, { useState, useCallback } from 'react';
import axios from 'axios';
import { MathJaxContext, MathJax } from 'better-react-mathjax';
import SenAnimation from './SenAnimation';
import OcrUpload from './OcrUpload';

const mathJaxConfig = {
  loader: { load: ["input/tex", "output/chtml"] }, // 確保載入必要的模組
  tex: {
    inlineMath: [['$', '$'], ['\\(', '\\)']],
    displayMath: [['$$', '$$'], ['\\[', '\\]']],
    processEscapes: true
  }
};


interface MCQ {
  question: string;
  options: { [key: string]: string };
  answer: string;
  explanation?: string;
  latex_steps: string;
}

function App() {
  const [topic, setTopic] = useState('HKDSE 代數');
  const [senMode, setSenMode] = useState(false);
  const [mcq, setMcq] = useState<MCQ | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState('');
  const [totalScore, setTotalScore] = useState(0);
  const [questionCount, setQuestionCount] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [showSenAnimation, setShowSenAnimation] = useState(false);
  // 新增狀態
  const [difficulty, setDifficulty] = useState('medium');
  const [aiMode, setAiMode] = useState(true);
  const [avgScore, setAvgScore] = useState(0);

  // ✅ 新增：答案顯示控制
  const [showAnswer, setShowAnswer] = useState(false);


  // 更新 generateMCQ
  const generateMCQ = useCallback(async () => {
    // ✅ 重置所有相關狀態
    setFeedback('');
    setSelectedAnswer('');
    setShowAnswer(false);
    setLoading(true);
    setError('');
    try {
      const res = await axios.post('http://localhost:3001/api/generate-mcq', {
        topic,
        senMode,
        useAI: aiMode,
        studentScore: avgScore, // 傳送平均分數調整難度
        difficulty
      });
      setMcq(res.data);
      setQuestionCount(prev => prev + 1); // ✅ 題數遞增
      
      console.log('✅ 新題目載入:', res.data.question.substring(0, 50) + '...');
    } catch (err: any) {
      setError('生成失敗，請檢查後端');
      console.error('❌ 錯誤:', err);
    }
    setLoading(false);
  }, [topic, senMode, aiMode, avgScore, difficulty]);

  // 更新計分邏輯
  const handleOptionClick = async (option: string) => {
    if (!mcq || feedback) return; // ✅ 已答題不重複
    
    setSelectedAnswer(option);
    
    try {
      const res = await axios.post('http://localhost:3001/api/submit-answer', {
        mcq,
        studentAnswer: option
      });
      
      const thisScore = res.data.score;
      setFeedback(res.data.feedback);
      setTotalScore(prev => prev + thisScore);
      
      // ✅ 計算平均分數，調整下一題難度
      const newAvg = totalScore / Math.max(1, questionCount);
      setAvgScore(newAvg);
      
      console.log(`📊 平均分數: ${newAvg.toFixed(0)}% → 下一題難度: ${newAvg < 60 ? 'easy' : newAvg > 85 ? 'hard' : 'medium'}`);
      
      //setTimeout(() => {
      //  setMcq(null);
      //  setFeedback('');
      //  setSelectedAnswer('');
      //}, 3000);
      
    } catch (error) {
      console.error('計分錯誤:', error);
      setFeedback('計分失敗，請重試');
    }
  };

  // ✅ 新增：手動顯示答案按鈕
  const handleShowAnswer = () => {
    setShowAnswer(true);
  };

  // ✅ 新增：下一題按鈕
  const handleNextQuestion = () => {
    generateMCQ();
  };

  const handleGenerate = useCallback(() => {
    if (senMode) {
      setShowSenAnimation(true);
      return;
    }
    generateMCQ();
  }, [senMode, generateMCQ]);

  

  // SEN 動畫完成
  const handleAnimationComplete = () => {
    setShowSenAnimation(false);
    generateMCQ();
  };

  // SEN 動畫顯示
  if (showSenAnimation) {
    return <SenAnimation onComplete={handleAnimationComplete} />;
  }

  return (
    <MathJaxContext config={mathJaxConfig}>
      <div style={{ 
        padding: '40px', 
        maxWidth: '1000px', 
        margin: '0 auto',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}>
        {/* 標題 + 分數 */}
        <div style={{ 
          textAlign: 'center', 
          marginBottom: '40px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          padding: '30px',
          borderRadius: '24px',
          boxShadow: '0 20px 40px rgba(102,126,234,0.3)'
        }}>
          <h1 style={{ fontSize: '36px', margin: 0, fontWeight: '800' }}>
            🤖 AI Math Learning Demo
          </h1>
          <p style={{ fontSize: '18px', opacity: 0.9, margin: '10px 0 0 0' }}>
            HKDSE 數學智能練習系統
          </p>
          <div style={{ 
            fontSize: '24px', 
            fontWeight: '700', 
            marginTop: '20px',
            background: 'rgba(255,255,255,0.2)',
            padding: '15px 30px',
            borderRadius: '16px',
            display: 'inline-block'
          }}>
            分數：{totalScore} / {questionCount * 100} 
            ({questionCount}題)
          </div>
        </div>

        <div style={{ 
          display: 'flex', 
          gap: '20px', 
          justifyContent: 'center', 
          marginTop: '20px',
          flexWrap: 'wrap'
        }}>
          <div style={{ 
            background: 'rgba(255,255,255,0.2)', 
            padding: '12px 24px', 
            borderRadius: '12px',
            fontSize: '18px'
          }}>
            平均分數：{avgScore.toFixed(0)}%
          </div>
          <div style={{ 
            background: 'rgba(255,255,255,0.2)', 
            padding: '12px 24px', 
            borderRadius: '12px',
            fontSize: '18px'
          }}>
            下一題難度：{avgScore < 60 ? '🟢 簡單' : avgScore > 85 ? '🔴 困難' : '🟡 中等'}
          </div>
        </div>

        {/* 控制面板 */}
        {!mcq && !showSenAnimation && (
          <div style={{ 
            padding: '40px', 
            border: '3px solid #e5e7eb', 
            borderRadius: '24px',
            background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
            textAlign: 'center'
          }}>
            <div style={{ marginBottom: '32px' }}>
              <label style={{ fontSize: '20px', fontWeight: '600', color: '#1f2937' }}>
                📚 選擇主題：
                <input 
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  style={{ 
                    marginLeft: '16px', 
                    padding: '14px 20px', 
                    border: '3px solid #d1d5db',
                    borderRadius: '12px',
                    fontSize: '18px',
                    width: '320px',
                    fontWeight: '500'
                  }}
                  placeholder="HKDSE 代數 / HKDSE 幾何 / 微積分..."
                />
              </label>
              <label style={{ 
                marginLeft: '40px', 
                fontSize: '18px', 
                display: 'inline-flex', 
                alignItems: 'center',
                gap: '12px'
              }}>
                <input 
                  type="checkbox" 
                  checked={senMode} 
                  onChange={(e) => setSenMode(e.target.checked)}
                />
                <span style={{ fontWeight: '600', color: '#dc2626' }}>
                  🎬 SEN學生模式（先看動畫）
                </span>
              </label>
            </div>

            {/* 難度 + AI 切換 */}
            <div style={{ marginBottom: '24px', display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '18px' }}>
                <strong>難度：</strong>
                <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} style={{ padding: '8px 16px', borderRadius: '8px' }}>
                  <option value="easy">🟢 簡單</option>
                  <option value="medium">🟡 中等</option>
                  <option value="hard">🔴 困難</option>
                </select>
              </label>
              
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '18px' }}>
                <input 
                  type="checkbox" 
                  checked={aiMode} 
                  onChange={(e) => setAiMode(e.target.checked)}
                />
                <span>🤖 AI 生成題目</span>
              </label>
            </div>

            <button
              onClick={handleGenerate}
              disabled={loading}
              style={{
                padding: '20px 48px',
                fontSize: '22px',
                fontWeight: '700',
                background: loading 
                  ? '#9ca3af' 
                  : 'linear-gradient(45deg, #10b981, #059669)',
                color: 'white',
                border: 'none',
                borderRadius: '20px',
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: '0 15px 35px rgba(16,185,129,0.4)',
                transition: 'all 0.3s ease'
              }}
            >
              {loading 
                ? '⏳ 智能生成中...' 
                : senMode 
                  ? '🎬 先睇 30秒 教學動畫' 
                  : '🚀 生成 HKDSE 數學題'
              }
            </button>

            <div style={{ 
              marginTop: '24px', 
              padding: '20px', 
              background: 'rgba(59,130,246,0.1)',
              borderRadius: '16px',
              fontSize: '16px',
              color: '#1e40af'
            }}>
              💡 <strong>後端狀態：</strong>
              <a href="http://localhost:3001/api/health" 
                 target="_blank" 
                 style={{ color: '#3b82f6', textDecoration: 'none' }}
                 rel="noreferrer">
                http://localhost:3001 ✅
              </a>
            </div>
          </div>
        )}

        

        {/* 錯誤訊息 */}
        {error && (
          <div style={{
            margin: '24px 0',
            padding: '24px',
            background: '#fee2e2',
            border: '3px solid #f87171',
            borderRadius: '16px',
            color: '#dc2626',
            fontSize: '18px'
          }}>
            ❌ {error}
            <button 
              onClick={() => setError('')}
              style={{
                marginLeft: '20px',
                padding: '8px 16px',
                background: '#f87171',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              關閉
            </button>
          </div>
        )}

        {/* ✅ MCQ 題目 - 預先不顯示答案 */}
        {mcq && (
          <div style={{
            marginTop: '32px',
            padding: '40px',
            border: `4px solid ${feedback ? (totalScore === 100 * questionCount ? '#10b981' : '#f59e0b') : '#10b981'}`,
            borderRadius: '24px',
            background: feedback ? '#f0fdf4' : 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ 
                color: '#059669', 
                fontSize: '28px', 
                margin: 0,
                fontWeight: '800'
              }}>
                📝 第 {questionCount} 題
              </h2>
              {feedback && (
                <div style={{
                  padding: '12px 24px',
                  background: totalScore === 100 * questionCount ? '#dcfce7' : '#fef3c7',
                  borderRadius: '12px',
                  fontSize: '18px',
                  fontWeight: '700',
                  color: totalScore === 100 * questionCount ? '#166534' : '#92400e'
                }}>
                  {feedback}
                </div>
              )}
            </div>

            {/* 題目 */}
            <div style={{ 
              fontSize: '24px', 
              lineHeight: '1.6',
              marginBottom: '36px',
              padding: '32px',
              background: 'white',
              borderRadius: '20px',
              border: '3px solid #f3f4f6',
              boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
            }}>
              <MathJax>
              {mcq.question}
              </MathJax>
            </div>

            {/* ✅ 選項 - 選完鎖定 */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', 
              gap: '20px', 
              marginBottom: '32px' 
            }}>
              {Object.entries(mcq.options).map(([key, value]) => (
                <div 
                  key={key}
                  onClick={() => !feedback && handleOptionClick(key)} // ✅ 只允許一次點擊
                  style={{
                    padding: '28px 32px',
                    background: 'white',
                    border: `4px solid ${
                      selectedAnswer === key ? '#3b82f6' : 
                      feedback ? (mcq.answer === key ? '#10b981' : '#6b7280') : 
                      '#e5e7eb'
                    }`,
                    borderRadius: '20px',
                    fontSize: '20px',
                    cursor: feedback ? 'default' : 'pointer',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    opacity: feedback ? 0.8 : 1,
                    pointerEvents: feedback ? 'none' : 'auto', // ✅ 選完禁用點擊
                    transform: selectedAnswer === key ? 'scale(1.02)' : 'scale(1)'
                  }}
                >
                  <strong style={{ 
                    color: selectedAnswer === key ? '#3b82f6' : 
                           feedback && mcq.answer === key ? '#059669' : '#374151',
                    fontSize: '22px'
                  }}>
                    {key})
                  </strong> 
                  <span style={{ marginLeft: '16px' }}><MathJax dynamic>{value}</MathJax></span>
                </div>
              ))}
            </div>

            {/* ✅ 答案顯示控制：選完才有「查看答案」按鈕 */}
            {feedback && !showAnswer && (
              <div style={{
                textAlign: 'center',
                padding: '24px',
                background: 'rgba(59, 130, 246, 0.1)',
                borderRadius: '16px',
                marginBottom: '24px'
              }}>
                <button
                  onClick={handleShowAnswer}
                  style={{
                    padding: '16px 32px',
                    background: 'linear-gradient(45deg, #3b82f6, #1d4ed8)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '18px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    boxShadow: '0 8px 20px rgba(59, 130, 246, 0.3)'
                  }}
                >
                  👁️ 查看正確答案 + 解法
                </button>
              </div>
            )}

            {/* ✅ 只有點擊「查看答案」才顯示 */}
            {showAnswer && (
              <div style={{
                padding: '32px',
                background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
                border: '4px solid #3b82f6',
                borderRadius: '20px',
                marginBottom: '24px',
                boxShadow: '0 10px 30px rgba(59, 130, 246, 0.2)'
              }}>
                <h3 style={{ 
                  color: '#1e40af', 
                  marginBottom: '20px',
                  fontSize: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  ✅ 正確答案：{mcq.answer}
                </h3>
              <div style={{ fontSize: '18px', lineHeight: '1.8' }}>
                  <strong style={{ color: '#1e3a8a', fontSize: '20px' }}>詳細解法：</strong>
                  <div style={{ 
                    marginTop: '16px', 
                    padding: '24px', 
                    background: 'white', 
                    borderRadius: '12px',
                    borderLeft: '5px solid #3b82f6'
                  }}>
                  <MathJax dynamic>
                    {mcq.latex_steps || mcq.explanation || ""}
                  </MathJax>
                </div>
                </div>
              </div>
            )}

            {/* 操作按鈕 */}
            <div style={{ 
              marginTop: '32px', 
              display: 'flex', 
              gap: '16px', 
              justifyContent: 'center',
              flexWrap: 'wrap'
            }}>
              {/* ✅ 「下一題」直接生成新題 */}
              <button
                onClick={handleNextQuestion}
                disabled={loading}
                style={{
                  padding: '18px 36px',
                  background: loading ? '#9ca3af' : 'linear-gradient(45deg, #10b981, #059669)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '14px',
                  fontSize: '19px',
                  fontWeight: '700',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  boxShadow: '0 10px 25px rgba(16, 185, 129, 0.3)',
                  minWidth: '140px'
                }}
              >
                {loading ? '⏳ 生成中...' : '🚀 下一題'}
              </button>
              <button
                onClick={() => {
                  setMcq(null);
                  setFeedback('');
                  setSelectedAnswer('');
                  setShowAnswer(false);
                }}
                style={{
                  padding: '16px 32px',
                  background: '#6b7280',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '18px',
                  cursor: 'pointer'
                }}
              >
                🔄 新題目
              </button>
              <button
                onClick={() => {
                  setMcq(null);
                  setSenMode(!senMode);
                }}
                style={{
                  padding: '16px 32px',
                  background: senMode ? '#ef4444' : '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '18px',
                  cursor: 'pointer'
                }}
              >
                {senMode ? '❌ 關閉SEN模式' : '🎬 開啟SEN模式'}
              </button>
            </div>
          </div>
        )}


            {/* Day 3: OCR 批改區塊 */}
        <div style={{ marginTop: '40px' }}>
          <OcrUpload />
        </div>
      </div>


    </MathJaxContext>
  );

}

export default App;
