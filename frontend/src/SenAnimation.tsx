import React, { useEffect, useRef } from 'react';

interface SenAnimationProps {
  onComplete: () => void;
}

const SenAnimation: React.FC<SenAnimationProps> = ({ onComplete }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    let frameId: number;
    let time = 0;

    const animateApples = () => {
      // 清空畫布
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // 背景漸層
      const gradient = ctx.createLinearGradient(0, 0, 0, 400);
      gradient.addColorStop(0, '#87CEEB');
      gradient.addColorStop(1, '#E0F6FF');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 3個紅蘋果（左邊跳動）
      for (let i = 0; i < 3; i++) {
        ctx.save();
        ctx.translate(120 + i * 70 + Math.sin(time * 0.1 + i) * 8, 
                     220 + Math.cos(time * 0.08 + i) * 6);
        ctx.fillStyle = '#FF4757';
        ctx.shadowColor = 'rgba(255,71,87,0.5)';
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.arc(0, 0, 28, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.restore();
      }

      // + 號（放大縮小）
      ctx.save();
      ctx.translate(320, 220);
      ctx.scale(1 + Math.sin(time * 0.2) * 0.1, 1 + Math.sin(time * 0.2) * 0.1);
      ctx.font = 'bold 60px Arial';
      ctx.fillStyle = '#FFD93D';
      ctx.textAlign = 'center';
      ctx.fillText('+', 0, 20);
      ctx.restore();

      // 2個綠蘋果（右邊跳動）
      for (let i = 0; i < 2; i++) {
        ctx.save();
        ctx.translate(420 + i * 70 + Math.sin(time * 0.12 + i) * 10, 
                     220 + Math.cos(time * 0.1 + i) * 8);
        ctx.fillStyle = '#2ED573';
        ctx.shadowColor = 'rgba(46,213,115,0.5)';
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.arc(0, 0, 28, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.restore();
      }

      // 等號 + 結果
      ctx.font = 'bold 64px Arial';
      ctx.fillStyle = '#4B0082';
      ctx.textAlign = 'center';
      ctx.fillText('=', 580, 80);
      ctx.font = 'bold 80px Arial';
      ctx.fillStyle = '#FF6B9D';
      ctx.fillText('5', 580, 160);

      time++;
      frameId = requestAnimationFrame(animateApples);

      // 25秒自動完成
      if (time > 1500) {
        onComplete();
        cancelAnimationFrame(frameId);
      }
    };

    animateApples();
    return () => cancelAnimationFrame(frameId);
  }, [onComplete]);

  return (
    <div style={{ 
      textAlign: 'center', 
      padding: '40px', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      minHeight: '100vh',
      color: 'white'
    }}>
      <h1 style={{ fontSize: '36px', marginBottom: '30px' }}>
        🍎 SEN 學生專區
      </h1>
      <h2 style={{ fontSize: '28px', marginBottom: '20px' }}>
        先睇動畫學概念！
      </h2>
      <div style={{ position: 'relative', display: 'inline-block' }}>
        <canvas 
          ref={canvasRef} 
          width={700} 
          height={400}
          style={{ 
            borderRadius: '24px', 
            boxShadow: '0 25px 50px rgba(0,0,0,0.3)',
            border: '8px solid rgba(255,255,255,0.3)'
          }}
        />
        <div style={{
          position: 'absolute',
          top: '20px', left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(255,255,255,0.9)',
          padding: '12px 24px',
          borderRadius: '20px',
          fontSize: '20px',
          fontWeight: 'bold',
          color: '#333'
        }}>
          3個紅蘋果 + 2個綠蘋果 = ?
        </div>
      </div>
      <button
        onClick={onComplete}
        style={{
          marginTop: '40px',
          padding: '20px 50px',
          fontSize: '24px',
          background: 'linear-gradient(45deg, #FF6B9D, #C44569)',
          color: 'white',
          border: 'none',
          borderRadius: '50px',
          cursor: 'pointer',
          boxShadow: '0 15px 35px rgba(255,107,157,0.4)'
        }}
      >
        ✅ 我明白啦！開始做練習
      </button>
    </div>
  );
};

export default SenAnimation;
