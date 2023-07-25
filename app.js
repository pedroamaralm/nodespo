const express = require('express');
const axios = require('axios');
const querystring = require('querystring');
const dotenv = require('dotenv');
dotenv.config();

const app = express();
const PORT = 8888;
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;

app.get('/', (req, res) => {
  // Redirecionar o usuário para a página de autorização do Spotify
  const scopes = ['user-top-read'];
  res.redirect(
    `https://accounts.spotify.com/authorize?${querystring.stringify({
      response_type: 'code',
      client_id: CLIENT_ID,
      scope: scopes.join(' '),
      redirect_uri: REDIRECT_URI,
    })}`
  );
});

app.get('/callback', async (req, res) => {
  const code = req.query.code;

  // Obter o token de acesso usando o código de autorização
  const authOptions = {
    method: 'POST',
    url: 'https://accounts.spotify.com/api/token',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    data: querystring.stringify({
      code: code,
      redirect_uri: REDIRECT_URI,
      grant_type: 'authorization_code',
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
    }),
  };

  try {
    const response = await axios(authOptions);
    const access_token = response.data.access_token;

    // Obter as 10 músicas mais ouvidas do último mês
    const topTracksOptions = {
      method: 'GET',
      url: 'https://api.spotify.com/v1/me/top/tracks',
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
      params: {
        time_range: 'short_term',
        limit: 10,
      },
    };

    const topTracksResponse = await axios(topTracksOptions);
    const topTracks = topTracksResponse.data.items.map((track) => ({
      name: track.name,
      artists: track.artists.map((artist) => artist.name).join(', '),
      url: track.external_urls.spotify,
    }));

    // Renderizar as 10 músicas mais ouvidas para o usuário
    res.send(`
      <h1>As 10 músicas mais ouvidas do último mês:</h1>
      <ol>
        ${topTracks
          .map(
            (track) => `<li>${track.name} - ${track.artists} (<a href="${track.url}" target="_blank">ouvir no Spotify</a>)</li>`
          )
          .join('')}
      </ol>
    `);
  } catch (error) {
    console.error('Erro ao acessar a API do Spotify:', error.message);
    res.status(500).send('Erro ao acessar a API do Spotify.');
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
