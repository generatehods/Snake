<script>
    const grid = document.querySelector('.grid');
    const balanceDisplay = document.getElementById('balance');
    const connectBtn = document.getElementById('connectBtn');
    
    // --- KONFIGURASI TOKEN ANDA ---
    // Masukkan Mint Address Token Anda di sini nanti
    const MINT_ADDRESS = "ALAMAT_TOKEN_SNAKE_ANDA"; 
    
    let squares = [];
    let snake = [2, 1, 0];
    let appleIndex = 0;
    let direction = 1;
    const width = 10;
    let score = 0;
    let intervalTime = 400; 
    let interval = 0;
    let userWallet = null;

    // --- SOLANA LOGIC DENGAN SPL TOKEN ---
    async function connectWallet() {
        if ("solana" in window) {
            try {
                const resp = await window.solana.connect();
                userWallet = resp.publicKey;
                connectBtn.innerText = "CONNECTED";
                updateTokenBalance();
            } catch (err) { console.error(err); }
        } else { alert("Gunakan Phantom Browser!"); }
    }

    async function updateTokenBalance() {
        if (!userWallet) return;
        
        const connection = new solanaWeb3.Connection(solanaWeb3.clusterApiUrl('mainnet-beta'));
        
        try {
            // Mencari akun token SPL milik user
            const tokenAccounts = await connection.getParsedTokenAccountsByOwner(userWallet, {
                mint: new solanaWeb3.PublicKey(MINT_ADDRESS)
            });

            if (tokenAccounts.value.length > 0) {
                const amount = tokenAccounts.value[0].account.data.parsed.info.tokenAmount.uiAmount;
                balanceDisplay.innerText = amount + " SNK"; // Ganti SNK dengan simbol token Anda
            } else {
                balanceDisplay.innerText = "0.00";
            }
        } catch (err) {
            console.log("Token belum ada di wallet user.");
            balanceDisplay.innerText = "0.00";
        }
    }

    // --- GAME LOGIC ---
    function createGrid() {
        for (let i = 0; i < 100; i++) {
            const square = document.createElement('div');
            grid.appendChild(square);
            squares.push(square);
        }
    }
    createGrid();

    function draw() {
        squares.forEach(sq => sq.classList.remove('snake'));
        snake.forEach(index => squares[index].classList.add('snake'));
    }

    function move() {
        if (
            (snake[0] + width >= 100 && direction === width) || 
            (snake[0] % width === width - 1 && direction === 1) || 
            (snake[0] % width === 0 && direction === -1) || 
            (snake[0] - width < 0 && direction === -width) || 
            squares[snake[0] + direction].classList.contains('snake')
        ) {
            // LOGIKA NYAWA: Berkurang saat mati
            alert("GAME OVER! Token Berkurang 1");
            return location.reload();
        }

        const tail = snake.pop();
        squares[tail].classList.remove('snake');
        snake.unshift(snake[0] + direction);
        
        if (squares[snake[0]].classList.contains('apple')) {
            squares[snake[0]].classList.remove('apple');
            squares[tail].classList.add('snake');
            snake.push(tail);
            score++;
            document.getElementById('score-board').innerText = 'Score: ' + score;
            generateApple();
            // Di sini Anda bisa memanggil fungsi untuk menambah token (Reward)
        }
        draw();
    }

    function generateApple() {
        do {
            appleIndex = Math.floor(Math.random() * squares.length);
        } while (squares[appleIndex].classList.contains('snake'));
        squares[appleIndex].classList.add('apple');
    }
    generateApple();

    function changeDir(move) {
        if (move === 'UP' && direction !== width) direction = -width;
        if (move === 'DOWN' && direction !== -width) direction = width;
        if (move === 'LEFT' && direction !== 1) direction = -1;
        if (move === 'RIGHT' && direction !== -1) direction = 1;
    }

    interval = setInterval(move, intervalTime);
</script>

