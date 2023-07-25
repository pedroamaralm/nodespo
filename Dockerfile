# Use a imagem base do Node.js
FROM node:14

# Defina o diretório de trabalho dentro do contêiner
WORKDIR /app

RUN npm install express axios querystring dotenv

# Copie os arquivos do projeto para o diretório de trabalho
COPY package.json package-lock.json /app/
RUN npm install

# Copie o restante dos arquivos do projeto
COPY . /app

# Exponha a porta em que o servidor Node.js está ouvindo (PORT 8888)
EXPOSE 8888

# Inicie o servidor Node.js
CMD ["node", "app.js"]
