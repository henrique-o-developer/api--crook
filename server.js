const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const Mega = require('megadb');
const sitesCadastrados = new Mega.crearDB('Sites')

app.get("/sites", async(req, res) => {
    res.get(await sitesCadastrados.obtener('SITES'));
})


server.listen(3000, () => {
    console.log('listening on *:3000');
});
