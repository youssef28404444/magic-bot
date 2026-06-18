FROM node:18-slim

# تثبيت المتصفح والاعتماديات اللازمة
RUN apt-get update && apt-get install -y \
    chromium \
    fonts-liberation \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

WORKDIR /app

# نسخ ملفات المشروع وتثبيت المكتبات
COPY package.json ./
RUN npm install

# نسخ باقي الكود
COPY index.js ./

EXPOSE 8080
CMD ["node", "index.js"]
