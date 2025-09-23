/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/page-components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // 민트색 로고 기반 테마
        'primary': '#7fffd4',        // 민트색
        'primary-dark': '#5fe0c1',   // 어두운 민트색
        'primary-light': '#a0ffed',  // 밝은 민트색
        'secondary': '#333333',      // 로고의 CODING 텍스트 색상
        'text-title': '#333333',     // 제목 텍스트
        'bg-main': '#f0fffd',        // 메인 배경색
        'card-bg': '#ffffff',        // 카드 배경색
        'text-main': '#333333',      // 메인 텍스트
        'text-light': '#6c757d',     // 연한 텍스트
        'border-main': '#c5f3ea',    // 테두리 색상
        'gray-main': '#e9f7f5',      // 회색
        'gray-dark': '#aedbd4',      // 어두운 회색
        'success': '#4bc0a0',        // 성공 색상
        'success-bg': '#e7f9f4',     // 성공 배경
        'success-border': '#a7e9d9', // 성공 테두리
        'error': '#e63946',          // 에러 색상
        'error-bg': '#fdebec',       // 에러 배경
        'error-border': '#f5c2c7',   // 에러 테두리
      },
      fontFamily: {
        'noto': ['Noto Sans KR', 'sans-serif'],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      boxShadow: {
        'card': '0 6px 12px rgba(72, 209, 204, 0.1), 0 2px 4px rgba(72, 209, 204, 0.06)',
        'card-hover': '0 12px 24px rgba(72, 209, 204, 0.12), 0 6px 12px rgba(72, 209, 204, 0.08)',
        'button': '0 4px 15px rgba(127, 255, 212, 0.4)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'bounce-gentle': 'bounceGentle 1s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        bounceGentle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
      },
    },
  },
  plugins: [],
}
