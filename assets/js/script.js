const Modal = { 
    toggle(){ //Abre e fecha modal
        document.querySelector('.modal-overlay').classList.toggle('active')
    },
}

const Storage = {
    get() {
        return JSON.parse(localStorage.getItem("dev.finances:transactions")) || []
    },

    set(transaction) {
        localStorage.setItem("dev.finances:transactions", JSON.stringify(transaction));
    }
}

const Transaction = {
    all: Storage.get(), //Transações do app (valor) 
       

    add(transaction){ //Adiciona valor
        Transaction.all.push(transaction)
        App.reload() //reload no app
    },

    incomes(){ //Soma todos os valores de Rendas, valor positivo
        let income = 0
        Transaction.all.forEach(transaction => {
            if(transaction.amount > 0){
                income += transaction.amount
            }
        })
        return income
    },

    expenses(){ //soma todos os valores de Rendas, valor negativo
        let expense = 0
        Transaction.all.forEach(transaction => {
                if(transaction.amount < 0){
                    expense += transaction.amount
                }
            })
            return expense
        },

    total(){ //soma o positivo com o negativo que resulta no total
        return Transaction.incomes() + Transaction.expenses()
    }
}

const DOM = { //Manipula toda a interface. transacoes, erros, etc.
    transactionContainer: document.querySelector('#data-table tbody'),

    addTransaction(transaction, index){ //Adiciona uma transação no html
        const tr = document.createElement('tr')
        tr.innerHTML = DOM.innerHTMLTransaction(transaction, index)
        tr.dataset.index = index
        DOM.transactionContainer.appendChild(tr)
    },

    remove(index){ //Remove uma transação
        Transaction.all.splice(index, 1)
        App.reload()
    },

    innerHTMLTransaction(transaction, index){ //Html, classes inseridas, etc.
        const CSSclass = transaction.amount > 0 ? "income" : "expense"
        const amount = Utils.formatCurrency(transaction.amount)
        const html = `
            <td class="description">${transaction.description}</td>
            <td class="${CSSclass}"> ${amount}</td>
            <td class="date">${transaction.date}</td>
            <td>
            <img onclick="DOM.remove(${index})" src="assets/minus.svg" alt="Remover transacao">
            </td>
        `
        return html
    },

    updateBalance(){ //Atualiza os valors já formatado, utilizando uma funcão
                    //Do objeto Utils
        document
        .getElementById('incomeDisplay').innerHTML = Utils.formatCurrency(Transaction.incomes());

        document
        .getElementById('expenseDisplay').innerHTML = Utils.formatCurrency(Transaction.expenses());
        document
        .getElementById('totalDisplay').innerHTML = Utils.formatCurrency(Transaction.total());
    },

    cleanTransaction(){ //Limpa as transações duplicadas
        DOM.transactionContainer.innerHTML = "";
    }
}

const Utils = {
    formatCurrency(value){ // Formata os valores, para moeda LOCAL, etc.
        const signal = Number(value) < 0 ? "-" : ""

        value = String(value).replace(/\D/g, "")

        value = Number(value) / 100

        value = value.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        })

        return signal + value
    },

    formatAmount(value){ //Formata o valor inserido no input
        value = Number(value) * 100
        return value
    },

    formatDate(value){ //Formata a data utilizando o split.
        const splittedDate = value.split("-")
        return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`
    }
}

const Form = {

    //Seleciona todos os input's utilizado
    description: document.querySelector("input#description"),
    date: document.querySelector("input#date"),
    amount: document.querySelector("input#amount"),


    getValues(){ // Pega os valores descritos
        return {
            description: Form.description.value,
            date: Form.date.value,
            amount: Form.amount.value
        }
    },

    validadeFields(){ //Realiza as validações do formulario.
        const {description, date, amount} = Form.getValues() //Descontrutura 
        //O objeto, passando para os descritivos informados.


        //Faz uma verificação para ver se todos os campos foram preenchidos
        if(description.trim() === "" || 
        date.trim() === "" || 
        amount.trim() === ""){
            throw new Error('Por favor, preencha todos os campos!') //Dispara o erro
        }
    },

    formartValues(){ // Formata os valores, utilizando a funcao do Utils
        let {description, date, amount} = Form.getValues()

        amount = Utils.formatAmount(amount)
        date = Utils.formatDate(date)

        return {
            description,
            date,
            amount
        }
    },

    clearFields(){ //Limpa os formularios por ultimo
        Form.description.value = ""
        Form.amount.value = ""
        Form.date.value = ""
    },


    submit(event){ //Envio do formulario
        event.preventDefault()
        
        try { //Tente fazer isso abaixo
            //Verificar se todas as informacoes foram preenchidas
            Form.validadeFields();
            //Formatar os dados para salvar
            const transaction = Form.formartValues()
            //Salvar
            Transaction.add(transaction)
            //Apagar os dados do formulario
            Form.clearFields()
            //Fechar modal
            Modal.toggle()

        } catch (error) { //Captura o erro
            alert(error.message)
        }
    
    }
}

const App = {
    init(){ //Inicia o App. Adicionando as transacoes na tela.
        Transaction.all.forEach((transaction, index) => {
            DOM.addTransaction(transaction, index)
        })

        DOM.updateBalance() //Atualiza os valores
        

        Storage.set(Transaction.all)

    },


    reload(){
        DOM.cleanTransaction() //Limpa o tbody duplicado
        App.init()
    }
}

App.init()
