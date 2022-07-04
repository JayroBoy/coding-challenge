'use strict'

const JSONdb = require('simple-json-db');
const db = new JSONdb('database/storage.json');

const express = require('express');
const app = express();

const PORT = 3000;

app.use(express.static("public"));
app.use(express.json());

//Gives back the entire database to the user
app.get('/db', (req, res) =>{
    res.status(200).json(db.JSON());
})

//Returns true if the key is in the database and false if it isn't
app.get('/db/:email', (req, res) =>{
    if(db.has(req.params.email)) res.send(true);
    else res.send(false); 
});


//Information update
app.put('/db/:email', (req, res) =>{
    const email = req.body.email;
    const nome = req.body.nome;
    const cpf = req.body.cpf;
    const grupo = req.body.grupo;
    const nomeGrupo = req.body.nomeGrupo;
    const endereco = req.body.endereco;
    const telefone = req.body.telefone;
    const dataNasc = req.body.dataNasc;
    const galener = {email: email, nome: nome, cpf: cpf, grupo: grupo, nomeGrupo: nomeGrupo, endereco: endereco, telefone:telefone, dataNasc:dataNasc}
    db.set(email , galener);

    res.send(galener);

});

//Creation of new person
app.post('/db/:email', (req, res) =>{
    const email = req.body.email;
    const nome = req.body.nome;
    const cpf = req.body.cpf;
    const grupo = req.body.grupo;
    const nomeGrupo = req.body.nomeGrupo;
    const endereco = req.body.endereco;
    const telefone = req.body.telefone;
    const dataNasc = req.body.dataNasc;
    const galener = {email: email, nome: nome, cpf: cpf, grupo: grupo, nomeGrupo: nomeGrupo, endereco: endereco, telefone:telefone, dataNasc:dataNasc}
    db.set(email , galener);

    res.send(galener);

});

app.delete('/db/:email', (req, res) =>{
    db.delete(req.params.email);
    res.status(200);
    res.send(`${req.params.email} apagado`);
});

app.listen(
    PORT, 
    () => console.log(`Listening on port ${PORT}`)
);