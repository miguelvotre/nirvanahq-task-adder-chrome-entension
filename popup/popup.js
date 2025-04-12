const nirvana = new NirvanaAPI();

document.addEventListener('DOMContentLoaded', () => {
    // Verificar se já existe um token salvo
    chrome.storage.local.get(['authToken', 'userEmail'], (result) => {
        if (result.authToken) {
            loginForm.innerHTML = `
                <h2>Adicionar Tarefa</h2>
                <p>Logado como: ${result.userEmail}</p>
                <div class="checkbox-wrapper">
                    <input type="checkbox" id="add-page-check" checked>
                    <label for="add-page-check">Adicionar página atual</label>
                </div>
                <input type="text" id="task-title" placeholder="Título da tarefa">
                <textarea id="task-notes" placeholder="Notas (opcional)"></textarea>
                <button id="add-task-btn">Adicionar Tarefa</button>
                <button id="logout-btn">Sair</button>
            `;

            // Handler do checkbox
            const checkbox = document.getElementById('add-page-check');
            const titleInput = document.getElementById('task-title');
            const notesInput = document.getElementById('task-notes');

            checkbox.addEventListener('change', () => {
                if (checkbox.checked) {
                    // Pegar informações da página atual
                    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
                        if (tabs[0]) {
                            titleInput.value = tabs[0].title || '';
                            notesInput.value = tabs[0].url || '';
                        }
                    });
                } else {
                    // Limpar os campos
                    titleInput.value = '';
                    notesInput.value = '';
                }
            });

            // Preencher dados iniciais (já que o checkbox começa marcado)
            chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
                if (tabs[0]) {
                    titleInput.value = tabs[0].title || '';
                    notesInput.value = tabs[0].url || '';
                }
            });

            // Adicionar handler para logout
            document.getElementById('logout-btn').addEventListener('click', () => {
                chrome.storage.local.clear(() => {
                    window.location.reload();
                });
            });

            // Handler para criar tarefa
            document.getElementById('add-task-btn').addEventListener('click', async () => {
                const addTaskBtn = document.getElementById('add-task-btn');
                try {
                    const title = titleInput.value.trim();
                    if (!title) {
                        throw new Error('Por favor, insira um título para a tarefa');
                    }

                    addTaskBtn.disabled = true;
                    addTaskBtn.textContent = 'Adicionando...';

                    await nirvana.createTask(
                        result.authToken,
                        title,
                        notesInput.value.trim()
                    );

                    // Limpar campos e mostrar sucesso
                    titleInput.value = '';
                    notesInput.value = '';
                    checkbox.checked = false; // Desmarcar checkbox
                    addTaskBtn.textContent = '✓ Tarefa Adicionada!';
                    addTaskBtn.classList.add('success'); // Adiciona classe para mudar cor
                    setTimeout(() => {
                        addTaskBtn.textContent = 'Adicionar Tarefa';
                        addTaskBtn.classList.remove('success'); // Remove classe
                        addTaskBtn.disabled = false;
                    }, 2000);

                } catch (error) {
                    alert(error.message);
                    addTaskBtn.textContent = 'Adicionar Tarefa';
                    addTaskBtn.disabled = false;
                }
            });
        }
    });

    // Manipular o formulário de login
    const loginForm = document.getElementById('login-form');
    const loginBtn = document.getElementById('login-btn');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');

    // Adicionar handler para tecla Enter
    passwordInput.addEventListener('keyup', (event) => {
        if (event.key === 'Enter') {
            loginBtn.click();
        }
    });

    loginBtn.addEventListener('click', async () => {
        try {
            loginBtn.disabled = true;
            loginBtn.textContent = 'Entrando...';

            const email = emailInput.value;
            const password = passwordInput.value;

            if (!email || !password) {
                throw new Error('Por favor, preencha todos os campos');
            }

            const token = await nirvana.login(email, password);
            
            // Salvar o token
            chrome.storage.local.set({ 
                authToken: token,
                userEmail: email 
            }, () => {
                console.log('Login successful!');
                window.location.reload();
            });

        } catch (error) {
            alert(error.message || 'Falha no login. Tente novamente.');
        } finally {
            loginBtn.disabled = false;
            loginBtn.textContent = 'Login';
        }
    });
});
