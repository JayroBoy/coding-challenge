Para rodar essa versão do processador, é preciso instalar o live server
	sudo apt-get install node
	sudo apt-get install npm
	npm install live-server 
	
Navegar até o diretório com o arquivo index.html e o arquivo main.js e digitar o comando
	live-server
	
Ele deve abrir automaticamente uma guia no seu navegador padrão
Essa versão local salva os dados no localStorage, portanto há permanencia mesmo que o servidor seja desligado,
no entanto, não há como enviar dados de um cliente para o outro por meio desse sistema