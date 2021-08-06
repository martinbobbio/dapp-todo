App = {
    contracts: {},
    init: async () => {
        await App.loadEthereum()
        await App.loadAccount()
        await App.loadContracts()
        await App.render()
        await App.renderTask()
    },
    loadEthereum: async() => {
        if (window.ethereum) {
            App.web3Provider = window.ethereum
            await window.ethereum.request({method: 'eth_requestAccounts'})
        } else if (window.web3) {
            web3 = new Web3(window.web3.currentProvider)
        } else {
            console.log('You dont have ethereum, try to use Metamask.')
        }
    },
    loadContracts: async () => {
        const response = await fetch('TasksContract.json')
        const taskContractJSON = await response.json()
        App.contracts.tasksContract = TruffleContract(taskContractJSON)
        App.contracts.tasksContract.setProvider(App.web3Provider)
        App.tasksContract = await App.contracts.tasksContract.deployed()
    },
    loadAccount: async () => {
        const accounts = await window.ethereum.request({method: 'eth_requestAccounts'})
        App.account = accounts[0]
    },
    render: () => {
        document.getElementById('account').innerText = App.account
    },
    renderTask: async () => {
        const taskCounter = await App.tasksContract.taskCounter()
        let html = ''
        for (let i = 0; i < taskCounter.toNumber(); i++) {
            const task = await App.tasksContract.tasks(i+1)
            console.log("TASK", task)
            const taskElement = `
                <div class='card bg-dark rounded-0 mb-2'>
                    <div class='card-header d-flex justify-content-between align-items-center'>
                        <span>${task.title}</span>
                        <div class='form-check form-switch'>
                            <input class='form-check-input' data-id='${task.id}' type='checkbox' ${ task.done && 'checked'} onchange='App.toggleDone(this)'/>
                        </div>
                    </div>
                    <div class='card-body'>
                        <span>${task.description}</span>
                        <p class='text-muted'>Task was created ${new Date(task.createdAt * 1000).toLocaleString()}</p>
                    </div>
                </div>
            `
            html += taskElement
        }
        document.querySelector('#taskList').innerHTML = html;
    },
    createTask: async (title, description) => {
        await App.tasksContract.createTask(title, description, {
            from: App.account
        })
        window.location.reload()
    },
    toggleDone: async (element) => {
        const taskId = element.dataset.id
        await App.tasksContract.toggleDone(taskId, {
            from: App.account
        })
        window.location.reload()
    }
}