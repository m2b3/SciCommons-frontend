'use client';

import React from 'react';

const CheckMarkAnimation = () => {
  return (
    <div className="checkmark-wrapper">
      <svg className="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
        <circle className="checkmark-circle" cx="26" cy="26" r="25" fill="none" />
        <path className="checkmark-check" fill="none" d="M14 26l10 10 15-15" />
      </svg>
      <style jsx>{`
        .checkmark-wrapper {
          display: flex;
          justify-content: center;
          align-items: center;
          width: 100px;
          height: 100px;
        }
        .checkmark {
          width: 100%;
          height: 100%;
          animation: scaleUp 0.4s ease-in-out forwards;
        }
        .checkmark-circle {
          stroke: #4caf50;
          stroke-width: 2;
          stroke-dasharray: 157;
          stroke-dashoffset: 157;
          animation: drawCircle 1s ease-in-out forwards;
        }
        .checkmark-check {
          stroke: #4caf50;
          stroke-width: 4;
          stroke-linecap: round;
          stroke-linejoin: round;
          stroke-dasharray: 48;
          stroke-dashoffset: 48;
          animation: drawCheck 0.5s 0.5s ease-in-out forwards;
        }
        @keyframes scaleUp {
          0% {
            transform: scale(0.8);
          }
          100% {
            transform: scale(1);
          }
        }
        @keyframes drawCircle {
          0% {
            stroke-dashoffset: 157;
          }
          100% {
            stroke-dashoffset: 0;
          }
        }
        @keyframes drawCheck {
          0% {
            stroke-dashoffset: 48;
          }
          100% {
            stroke-dashoffset: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default CheckMarkAnimation;
