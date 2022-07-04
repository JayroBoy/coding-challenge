# coding-challenge
Processador de planilhas para o Coding Challenge da Galena
Framework do servidor: https://expressjs.com/
Package da base de dados: https://github.com/nmaggioni/Simple-JSONdb

Em um terminal bash, navegar até a pasta do projeto
```
sudo apt-get install node
sudo apt-get install npm

npm i simple-json-db
npm install express
npm i nodemon


npm run devStart
```

Algumas observações:
1 - Como a idéia é receber uma planilha pronta e só facilitar a visualização, optei por não fazer correçao de erros. Meu pensamento foi que eu não tenho como
saber, por exemplo, qual digito está errado em um número de celular que veio com 10 digitos + ddd em vez de 9, então é preferível que eu mostre a informa-
ção conforme ela me foi entregue.

2 - Essa aplicação só aceita arquivos no formato .xlsx

3 - Essa aplicação considera que há um número fixo de campos que serão informados, e que esses campos são conhecidos previamente 
