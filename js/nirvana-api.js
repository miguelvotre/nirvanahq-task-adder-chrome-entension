class NirvanaAPI {
    constructor() {
        this.baseUrl = 'https://gc-api.nirvanahq.com/api';
        this.appId = 'com.nirvanahq.focus';
        this.appVersion = '3.9.8';
    }

    async login(email, password) {
        try {
            // Usando a biblioteca md5 importada
            const md5Password = md5(password);
            
            const url = `${this.baseUrl}/auth/new?appid=${this.appId}&appversion=${this.appVersion}`;
            
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    gmtoffset: '-3',
                    u: email,
                    p: md5Password
                })
            });

            const data = await response.json();
            
            if (data.results && data.results[0] && data.results[0].auth) {
                return data.results[0].auth.token;
            } else if (data.results && data.results[0] && data.results[0].error) {
                throw new Error(data.results[0].error.message);
            }
            
            throw new Error('Login failed');
        } catch (error) {
            throw error;
        }
    }

    async createTask(authToken, title, notes = '') {
        try {
            const timestamp = Date.now();
            const taskId = crypto.randomUUID(); // Gera um GUID único

            const params = new URLSearchParams({
                return: 'everything',
                since: timestamp,
                authtoken: authToken,
                appid: this.appId,
                appversion: this.appVersion,
                clienttime: timestamp,
                requestid: crypto.randomUUID()
            });

            const taskData = [{
                method: 'task.save',
                id: taskId,
                type: 0,
                _type: timestamp,
                parentid: '',
                _parentid: timestamp,
                waitingfor: '',
                _waitingfor: timestamp,
                state: 0,
                _state: timestamp,
                completed: 0,
                _completed: timestamp,
                cancelled: 0,
                _cancelled: timestamp,
                seq: timestamp,
                _seq: timestamp,
                seqt: 0,
                _seqt: timestamp,
                seqp: 0,
                _seqp: timestamp,
                name: title,
                _name: timestamp,
                tags: ',',
                _tags: timestamp,
                note: notes,
                _note: timestamp,
                ps: 0,
                _ps: timestamp,
                etime: 0,
                _etime: timestamp,
                energy: 0,
                _energy: timestamp,
                startdate: '',
                _startdate: timestamp,
                duedate: '',
                _duedate: timestamp,
                recurring: '',
                _recurring: timestamp,
                deleted: 0,
                _deleted: timestamp
            }];

            const response = await fetch(`${this.baseUrl}/everything?${params}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': '*/*',
                    'Referer': 'https://focus.nirvanahq.com/',
                    'Origin': 'https://focus.nirvanahq.com'
                },
                body: JSON.stringify(taskData)
            });

            const data = await response.json();
            
            if (data.results?.[0]?.error) {
                throw new Error(data.results[0].error.message);
            }

            return data;
        } catch (error) {
            throw new Error('Fail to create task: ' + error.message);
        }
    }
}
