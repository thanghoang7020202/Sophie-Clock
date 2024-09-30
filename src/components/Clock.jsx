import React, { useEffect, useRef, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css'; // FontAwesome icons
import backgroundImage from '../assets/cutest-animals.avif';

const Clock = () => {
    const canvasRef = useRef(null);
    const [size, setSize] = useState(0);
    const backgroundRef = useRef(null); // Ref to store preloaded background image

    const preloadBackgroundImage = () => {
        const img = new Image();
        img.src = backgroundImage;
        img.onload = () => {
            backgroundRef.current = img;
        };
    };

    const drawClock = (ctx, size) => {
        ctx.clearRect(0, 0, size, size);

        const centerX = size / 2;
        const centerY = size / 2;
        const radius = size * 0.4;

        if (backgroundRef.current) {
            ctx.filter = 'blur(8px)'; // Apply blur
            ctx.drawImage(backgroundRef.current, 0, 0, size, size); // Draw preloaded background
            ctx.filter = 'none'; // Reset filter
        }

        drawClockElements(ctx, centerX, centerY, radius, size);
    };

    const drawClockElements = (ctx, centerX, centerY, radius, size) => {
        // Define segments for the 24-hour outer clock
        const starts = [0, 5, 7, 12, 13, 19, 20, 21, 22, 24]; 
        const results = starts.map((start, idx) => {
            const end = starts[idx + 1] || 24;
            return end - start;
        });
        const labels = ['Ngủ', 'Gọi Chồng', 'Đi Làm', 'Ăn Trưa', 'Đi Làm', 'Đi về', 'Ăn Tối', 'Xem Phim', 'Ngủ'];

        let startAngle = Math.PI / 2;
        results.forEach((slice, idx) => {
            const sliceAngle = (slice / 24) * 2 * Math.PI;
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
            ctx.closePath();
            ctx.fillStyle = '#FFD1DC'; // Cute pastel pink
            ctx.fill();
            ctx.strokeStyle = '#FFB6C1'; // Lighter pink for stroke
            ctx.lineWidth = size / 300;
            ctx.stroke();

            const labelAngle = startAngle + sliceAngle / 2;
            const labelX = centerX + (radius * 0.85) * Math.cos(labelAngle);  
            const labelY = centerY + (radius * 0.85) * Math.sin(labelAngle);  

            ctx.fillStyle = '#4A4A4A'; // Softer dark gray for the text
            ctx.font = `${size / 40}px Coiny`;
            
            if (labels[idx]) {
                let label = labels[idx].split(' ');
                if (label.length > 1) {
                    ctx.fillText(label[0], labelX - ctx.measureText(label[0]).width / 2, labelY - size * 0.01); 
                    ctx.fillText(label[1], labelX - ctx.measureText(label[1]).width / 2, labelY + size * 0.01); 
                } else {
                    ctx.fillText(labels[idx], labelX - ctx.measureText(labels[idx]).width / 2, labelY + size * 0.01);
                }
            }

            startAngle += sliceAngle;
        });

        // Draw inner clock face
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius * 0.7, 0, 2 * Math.PI); 
        ctx.fillStyle = '#FFE1DC'; // Cute pastel pink
        ctx.fill();
         // Darker pink for stroke
        ctx.strokeStyle = '#FFB6C1'; 
        ctx.lineWidth = size / 300;
        ctx.stroke();

        // Draw hour numbers
        for (let i = 1; i <= 12; i++) {
            const angle = (i / 12) * 2 * Math.PI - Math.PI / 2;
            const numberX = centerX + (radius * 0.65) * Math.cos(angle);
            const numberY = centerY + (radius * 0.65) * Math.sin(angle);
            ctx.fillStyle = '#4A4A4A';  // Softer dark gray for the text
            ctx.font = `${size / 40}px Coiny`;

            if (i) {
                ctx.fillText(i, numberX - size * 0.02, numberY + size * 0.01); // Adjust text position
            }
        }
    };

    const drawHands = (ctx, centerX, centerY, radius, size) => {
        const now = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' }));
        const second = now.getSeconds();
        const minute = now.getMinutes();
        let hour = now.getHours();
        hour = hour % 12 + minute / 60;

        const drawHand = (angle, length, width, color) => {
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.lineTo(centerX + length * Math.cos(angle), centerY + length * Math.sin(angle));
            ctx.strokeStyle = color;
            ctx.lineWidth = width;
            ctx.stroke();
        };

        const secondAngle = ((second / 60) * 2 * Math.PI) - Math.PI / 2;
        const minuteAngle = ((minute / 60) * 2 * Math.PI) - Math.PI / 2;
        const hourAngle = ((hour / 12) * 2 * Math.PI) - Math.PI / 2;

        // Draw hands
        drawHand(secondAngle, radius * 0.7, size / 300, '#FF60B4'); // Hot pink second hand
        drawHand(minuteAngle, radius * 0.5, size / 150, '#4A4A4A'); // Gray minute hand
        drawHand(hourAngle, radius * 0.3, size / 100, '#4A4A4A'); // Gray hour hand

        const adjustedHour = (now.getHours() + 12) % 24; // Add 12 hours for display
        const trackerStartRadius = radius * 0.7; // Start at 0.7 of the radius
        const trackerEndRadius = radius * 1.0; // End at 1.0 of the radius

        const trackerAngle = (adjustedHour / 24) * 2 * Math.PI - Math.PI / 2; // 24-hour format

        // Draw the tracker line every 2 seconds
        if (second % 2 === 0) {
            // Draw the tracker line from 0.7 to 1.0 of the radius
            ctx.beginPath();
            ctx.moveTo(centerX + trackerStartRadius * Math.cos(trackerAngle), centerY + trackerStartRadius * Math.sin(trackerAngle));
            ctx.lineTo(centerX + trackerEndRadius * Math.cos(trackerAngle), centerY + trackerEndRadius * Math.sin(trackerAngle));
            ctx.strokeStyle = '#8000A0'; // Purple tracker line
            ctx.lineWidth = 5; // Tracker line width
            ctx.stroke();
        }
    };

    const animateClock = (ctx, size) => {
        drawClock(ctx, size); // Draw static elements like segments
        drawHands(ctx, size / 2, size / 2, size * 0.4, size); // Redraw hands
        requestAnimationFrame(() => animateClock(ctx, size)); // Loop animation
    };

    useEffect(() => {
        const handleResize = () => {
            const minDimension = Math.min(window.innerWidth, window.innerHeight);
            setSize(minDimension * 0.8);
        };

        window.addEventListener('resize', handleResize);
        handleResize();
        preloadBackgroundImage(); // Preload the background image

        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        if (size) {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            canvas.width = size;
            canvas.height = size;

            animateClock(ctx, size); // Start the animation loop
        }
    }, [size]);

    return (
        <div className="d-flex flex-column justify-content-center align-items-center bg-light">
            
            <h1 className="mb-4 text-primary" style={{ fontFamily: 'Coiny, sans-serif', color: '#FF69B4', backgroundRef: backgroundImage, backgroundSize: 'cover' }}>
                <i className="fas fa-heart text-danger"></i> Lịch Của Sophie iu
            </h1>

            <div className="card shadow-lg p-3 mb-5 bg-white rounded">
                <canvas ref={canvasRef} style={{ maxWidth: '100%', height: 'auto' }} />
            </div>
        </div>
    );
};

export default Clock;
