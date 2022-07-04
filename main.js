'use strict'

//1 - INTERFACE COM A BASE DE DADOS
/* Funções que interagem mais diretamente com a base de dados */

/**
 * Retorna um array de Objects em notação JSON com as informações dos galeners
 * @returns 
 */
function getFromStorage(){
    const galeners = JSON.parse(localStorage.getItem('galeners'));
    return galeners;
}

/**
 * Atualiza a base de dados com o novo array de Objects em notação JSON com as informações dos galeners
 * @param {Object} galeners 
 * @returns 
 */
function putInDatabase(galeners){
    localStorage.setItem('galeners', JSON.stringify(galeners));
    return;
}

/**
 * Recebe um JSON com informações de um Galener e preenche as informações indefinidas com "Não informado"
 * @param {Object} newGalener 
 * @returns 
 */
function sanitize(newGalener){
    var sanitized = newGalener;
    
    if(!sanitized.nome) sanitized.nome = "Não informado";
    if(!sanitized.grupo) sanitized.grupo = -1;
    if(!sanitized.nomeGrupo) sanitized.nomeGrupo = "Não informado";
    if(!sanitized.cpf) sanitized.cpf = "Não informado";
    if(!sanitized.telefone) sanitized.telefone = "Não informado";
    if(!sanitized.dataNasc) sanitized.dataNasc = "Não informado";
    if(!sanitized.endereco) sanitized.endereco = "Não informado";

    return sanitized;
}

/**
 * Função que adiciona as informações de um galener ao armazenamento
 * @param {*} newGalener 
 * @returns 
 */
function addToStorage(newGalener){
    const galeners = getFromStorage();

    let check = galeners.filter(galener => galener.email === newGalener.email).length > 0;
    
    //----------------------Edição de Cadastro---------------------------------
    if(check){ 
        for(let i = 0; i < galeners.length; i++){ //Busca simples percorrendo o vetor
            if(galeners[i].email === newGalener.email){
                galeners[i] = sanitize(newGalener);//
                putInDatabase(galeners); //Atualiza na base de dados
                fetchAllGaleners(); //repopula a tela
                return; //encerra a busca
            } 
        }    
    }

    //-----------------------Criação de Cadastro-------------------------------
    if(galeners === null) putInDatabase(sanitize(newGalener));
    else putInDatabase([...galeners, sanitize(newGalener)]) //E atualizamos a base de dados

    fetchAllGaleners();

    return;
}

/**
 * Função usada para descartar linhas espúrias da planilha
 * @param {Object} line 
 * @returns 
 */
function decide(line){
    if(line.email === null) return;
    if(line.email === 'E-mail') return;
    if(line.email === 'Export') return;
    return addToStorage(line);
}

//2 - MANIPULAÇÃO DA PLANILHA
/*Funções que lidam com a leitura e extração dos dados da planilha */ 

var planiglia = document.getElementById("planilha")


/**
 * Função que monitora o input de arquivos e chama o método de leitura de planilha caso necessário.
 * @param {*} evt 
 */
function importFile(evt) {
    var f = evt.target.files[0];
  
    if (f) {
        var r = new FileReader();
        r.onload = e => {
            var contents = processExcel(e.target.result); 
            //console.log("Tipo: ", typeof(contents), ", Tamanho: ", contents.length);
            for (const arr in contents){
                contents[arr].forEach((line)=>{
                    decide(line);
                });
            }
        }
        r.readAsBinaryString(f);
      
    } else {
        console.log("Failed to load file");
    }
}
 
/**
 * Função auxiliar para leitura da planilha
 * @param {*} data 
 * @returns 
 */
function processExcel(data) {
    var workbook = XLSX.read(data, {
        type: 'binary'
    });
  
    var data = to_json(workbook);
    return data;
  };
 
/**
 * Função que extrai as informações de uma página do arquivo e converte elas para objetos 
 * padronizados.
 * @param {"XLSX workbook"} workbook 
 * @returns 
 */
function to_json(workbook) {
    var result = {};
    workbook.SheetNames.forEach(function(sheetName) {
        var roa = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName],{
            header: ["email", "nome", "grupo", "nomeGrupo", "cpf", "telefone","dataNasc","endereco"],
            blankrows: false,
        });
        if (roa.length) result[sheetName] = roa;
    });
    return result;
};


planiglia.addEventListener("change", importFile, false); //Event listener de fornecimento do arquivo


// 3 - GUI
/* Funções que manipulam diretamente os elementos do DOM para mostrar ou esconder informações */

var topMostDisplay = document.getElementById("topmost");//Div utilizada na edição


/**
 * Preenche a lista com todos os Galeners cadastrados no servidor
 */
function fetchAllGaleners() {
    const galeners = getFromStorage();
    var galenerList = document.getElementById('galenersList'); 
    galenerList.replaceChildren();

    [...galeners].forEach( (galener) => {
        const newGalener = galenerCell(galener);
        galenerList.innerHTML += newGalener;
    })
}

/**
 * Cria um elemento HTML já preenchido. Argumentos faltantes devem ser passados como false.
 * @param {'Valid HTML Element type'} htmlType 
 * @param {String} id 
 * @param {Array} classes 
 * @param {String} type 
 * @returns {HTMLElement} Elemento criado
 */
function generateNewChild(htmlType, id, classes, type){
    let element = document.createElement(htmlType);
    
    if(id){
        element.setAttribute('id', id);
    }

    if(classes){
        classes.forEach((classe)=> element.classList.add(classe));
    }

    if(type){
        element.setAttribute("type", type);
    }

    return element;
}

/**
 * Preenche uma div no formulário de edição com um input e label dependendo de number, e coloca o valor padrão do input como info
 * @param {'HTML div'} div 
 * @param {Number} number 
 * @param {*} info 
 * @returns 
 */
function fillDivOnEditForm(div, number, galener){
    var label = generateNewChild("label", false, false, false);
    var input = generateNewChild("input", false, ["form-control"], false);

    div.appendChild(label);
    div.appendChild(input);

    switch(number){
        case 0:
            label.innerHTML = "E-mail";
            input.readOnly = true; //E-mail é chave primaria
            input.setAttribute("id", "email");
            input.setAttribute("type", "email");
            input.value = galener.email;
            break;
        case 1:
            label.innerHTML = "Nome";
            input.setAttribute("id", "nome");
            input.setAttribute("type", "text");
            input.value = galener.nome;
            break;
        case 2:
            label.innerHTML = "CPF";
            input.setAttribute("id", "cpf");
            input.setAttribute("type", "text"); 
            input.value = galener.cpf;
            break;
        case 3:
            label.innerHTML = "Grupo";
            input.setAttribute("id", "grupo");
            input.setAttribute("type", "number");
            input.value = galener.grupo;
            break;
        case 4:
            label.innerHTML = "Nome do Grupo";
            input.setAttribute("id", "nomeGrupo");
            input.setAttribute("type", "text");
            input.value = galener.nomeGrupo;
            break;
        case 5:
            label.innerHTML = "Telefone";
            input.setAttribute("id", "telefone");
            input.setAttribute("type", "tel");
            input.value = galener.telefone;
            break;
        case 6:
            label.innerHTML = "Data de Nascimento";
            input.setAttribute("id", "dataNasc");
            input.setAttribute("type", "date");
            input.value = galener.dataNasc;
            break;
        case 7:
            label.innerHTML = "Endereço";
            input.setAttribute("id", "endereco");
            input.setAttribute("type", "text");
            input.value = galener.endereco;
            break;
    }

    label.setAttribute("for", input.id);
    label.setAttribute("form", "editEntry");

    return;
}

/**
 * Apaga o conteúdo do Jumbotron
 */
function closeEditWindow() {
    topMostDisplay.replaceChildren(); //Apagar a caixa de edição
    return;
}

/**
 * Abre a janela de edição com os dados do galener em questão já preenchidos
 * @param {*} email 
 */
function openEditWindow(email){
    //Identificar o indivíduo sendo editado
    const galeners = JSON.parse(localStorage.getItem('galeners'));
    const galener = galeners.filter(person => person.email === email)[0];
    console.log(galener);
    
    //Preencher a caixa de edição
    topMostDisplay.appendChild(generateNewChild("form", "editEntry")); //Formulário   


    var form = document.getElementById("editEntry");
    //Itens do formulário
    for(let i = 0; i < 8; i++){
        form.appendChild(generateNewChild("div", ("div" + i) , false, false)); 
    }

    for(let i = 0; i < 8; i++){
        var divs = document.getElementById("div" + i);
        fillDivOnEditForm(divs, i, galener);
    }

    //Botão
    form.appendChild(generateNewChild("button", "btnEdit", ["btn", "btn-primary"], "submit"));
    document.getElementById("btnEdit").innerHTML = "Confirmar Alterações"


    //Fazendo o botão de edição funcionar
    form.addEventListener("submit", savePerson);
}
 
/**
 * Recebe um objeto e cria uma célula com as informações desse objeto na tela
 * @param {Object} galener 
 * @returns 
 */
function galenerCell(galener){
    const {email, nome, grupo, nomeGrupo, cpf, telefone, dataNasc, endereco} = galener;
    return `
        <div class = "rounded p-3 border bg-light mb-2">
            <h5 class="badge badge-success">${nomeGrupo}</h5>
            <p class="badge badge-info">${grupo}</p>
            <h3>${nome}</h3>
            <h5>${email}</h5>
            <h6>${cpf}</h6>

            <p>Telefone: ${telefone}<br>
            Endereço: ${endereco}<br>
            Data de Nascimento: ${dataNasc}
            </p>

            <a href="#" onclick="openEditWindow('${email}')" class="btn btn-warning"> Editar </a>
            <a href="#" onclick="deleteGalener('${email}')" class="btn btn-danger"> Excluir </a>
    
    
    `
}


//4 - LÓGICA DO PROGRAMA
/* Funções de nível médio: Não lidam com a base de dados diretamente, porém não alteram os elementos do DOM
diretamente também */

/**
 * Atualiza/Adiciona o cadastro de uma pessoa nova.
 * @param {Event} e 
 */
 function savePerson(e){
    e.preventDefault();

    const email = document.getElementById("email").value; 
    const nome = document.getElementById("nome").value;
    const grupo = document.getElementById("grupo").value;
    const nomeGrupo = document.getElementById("nomeGrupo").value;
    const cpf = document.getElementById("cpf").value; 
    const telefone = document.getElementById("telefone").value;
    const dataNasc = document.getElementById("dataNasc").value;
    const endereco = document.getElementById("endereco").value;

    var newGalener = {email: email, nome: nome, grupo: grupo, nomeGrupo: nomeGrupo, cpf: cpf, telefone: telefone, dataNasc: dataNasc, endereco: endereco};

    addToStorage(newGalener);

    fetchAllGaleners(); //Repopula o display com todos os galeners 
    closeEditWindow(); 
} 

/**
 * Apaga um cadastro do sistema, usando o email como chave de busca
 * @param {*} email 
 */
 function deleteGalener(email){
    const galeners = JSON.parse(localStorage.getItem('galeners'));

    const updated = galeners.filter(galener => galener.email !== email);

    localStorage.setItem('galeners', JSON.stringify(updated));
    fetchAllGaleners();
}

/**
 * Função de busca por match exato. Caso o usuário faça uma busca vazia, retorna todos os ~
 * elementos armazenados.
 */ 
 function searchBy(){
    const galeners = JSON.parse(localStorage.getItem('galeners'));
    var updated;
    const categoria = document.getElementById('sOptions').value;
    const valor = document.getElementById('valor').value;

    switch(categoria){
        case 'email':
            updated = galeners.filter(galener => galener.email === valor);
            break;
        case 'nome':
            updated = galeners.filter(galener => galener.nome === valor);
            break;
        case 'cpf':
            updated = galeners.filter(galener => galener.cpf === valor);
            break;
        case 'telefone':
            updated = galeners.filter(galener => galener.telefone === valor);
            break;
        case 'dataNasc':
            updated = galeners.filter(galener => galener.dataNasc === valor);
            break;
        case 'grupo':
            updated = galeners.filter(galener => galener.grupo === valor);
            break;
        case 'nomeGrupo':
            updated = galeners.filter(galener => galener.nomeGrupo === valor);
            break;
        case 'endereco':
            updated = galeners.filter(galener => galener.endereco === valor);
            break;
    }

    var galenerList = document.getElementById('galenersList'); 
    if(valor !== ""){ //Pesquisa vazia retorna todos os cadastrados

        galenerList.replaceChildren(); 

        if(!updated.length){
          console.log("Nenhum match encontrado")
        }
        [...updated].forEach( (galener) => {
            const newGalener = galenerCell(galener);
            galenerList.innerHTML += newGalener;
        })
    }else{
        fetchAllGaleners();
    }

}