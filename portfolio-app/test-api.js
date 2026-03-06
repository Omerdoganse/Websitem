// native fetch

async function testApi() {
    try {
        // 1. Post yetenek
        const loginRes = await fetch('http://localhost:3000/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: 'admin', password: 'admin' })
        });
        const loginData = await loginRes.json();
        console.log('Login Token:', loginData.token ? "Success" : loginData);

        const token = loginData.token;

        const skillRes = await fetch('http://localhost:3000/api/yetenekler', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ name: 'React', icon: 'fab fa-react' })
        });
        const skillData = await skillRes.json();
        console.log('Post Skill Response:', skillData);

        // 2. Post mesaj
        const msgRes = await fetch('http://localhost:3000/api/mesajlar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: 'Test', email: 'test@test.com', message: 'Hello World' })
        });
        const msgData = await msgRes.json();
        console.log('Post Msg Response:', msgData);

        // 3. Get mesajlar
        const msgsGetRes = await fetch('http://localhost:3000/api/mesajlar', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const msgsData = await msgsGetRes.json();
        console.log('Get Msgs Response:', msgsData);
    } catch (err) {
        console.error(err);
    }
}

testApi();
