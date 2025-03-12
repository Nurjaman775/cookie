class FriendsTable {
    constructor() {
        this.data = [];
        this.table = document.getElementById('friendsTable');
        this.tbody = this.table.querySelector('tbody');
        this.addButton = document.getElementById('addButton');
        this.API_URL = 'https://your-vercel-app.vercel.app/api/data'; // Ganti dengan URL Vercel actual
        this.init();
    }

    async init() {
        await this.loadFromAPI();
        this.addEventListeners();
    }

    async loadFromAPI() {
        try {
            const response = await fetch(this.API_URL);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            this.data = await response.json();
            this.renderTable();
        } catch (error) {
            console.error('Error loading data:', error);
            // Fallback ke localStorage jika API gagal
            this.data = JSON.parse(localStorage.getItem('friendsData') || '[]');
            this.renderTable();
            alert('Gagal memuat dari server, menggunakan data lokal');
        }
    }

    async saveToAPI() {
        try {
            const response = await fetch(this.API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(this.data)
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            // Backup ke localStorage
            localStorage.setItem('friendsData', JSON.stringify(this.data));
        } catch (error) {
            console.error('Error saving data:', error);
            // Fallback ke localStorage
            localStorage.setItem('friendsData', JSON.stringify(this.data));
            alert('Gagal menyimpan ke server, data disimpan lokal');
        }
    }

    validateInput(type, value) {
        switch(type) {
            case 'nim':
                return /^\d{9}$/.test(value);
            case 'nama':
                return /^[A-Za-z\s]+$/.test(value);
            default:
                return true;
        }
    }

    renderTable() {
        this.tbody.innerHTML = '';
        this.data.forEach((row, index) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${index + 1}</td>
                <td class="editable" data-type="nim">${row.nim}</td>
                <td class="editable" data-type="nama">${row.nama}</td>
                <td class="editable" data-type="kelas">${row.kelas}</td>
                <td class="editable" data-type="prodi">${row.prodi}</td>
                <td class="editable" data-type="alamat">${row.alamat}</td>
                <td><button class="delete-btn">Delete</button></td>
            `;
            this.tbody.appendChild(tr);
        });
    }

    makeEditable(cell) {
        const originalValue = cell.textContent;
        const type = cell.dataset.type;
        cell.classList.add('editing');
        
        const input = document.createElement('input');
        input.value = originalValue;
        
        const buttonGroup = document.createElement('div');
        buttonGroup.className = 'button-group';
        
        const okButton = document.createElement('button');
        okButton.textContent = 'Simpan';
        const cancelButton = document.createElement('button');
        cancelButton.textContent = 'Batal';
        
        buttonGroup.appendChild(okButton);
        buttonGroup.appendChild(cancelButton);
        
        cell.textContent = '';
        cell.appendChild(input);
        cell.appendChild(buttonGroup);
        
        input.focus();
        
        okButton.onclick = async () => {
            const newValue = input.value;
            if (this.validateInput(type, newValue)) {
                const rowIndex = cell.parentElement.rowIndex - 1;
                this.data[rowIndex][type] = newValue;
                cell.textContent = newValue;
                cell.classList.remove('editing');
                await this.saveToAPI();
            } else {
                alert('Input tidak valid!');
            }
        };
        
        cancelButton.onclick = () => {
            cell.textContent = originalValue;
            cell.classList.remove('editing');
        };
    }

    addEventListeners() {
        this.tbody.addEventListener('dblclick', (e) => {
            if (e.target.classList.contains('editable')) {
                this.makeEditable(e.target);
            }
        });

        this.tbody.addEventListener('click', async (e) => {
            if (e.target.classList.contains('delete-btn')) {
                if (confirm('Apakah Anda yakin ingin menghapus data ini?')) {
                    const row = e.target.closest('tr');
                    this.data.splice(row.rowIndex - 1, 1);
                    this.renderTable();
                    await this.saveToAPI();
                }
            }
        });

        this.addButton.addEventListener('click', async () => {
            this.data.push({
                nim: '000000000',
                nama: 'Mahasiswa Baru',
                kelas: 'X',
                prodi: 'Program Studi',
                alamat: 'Alamat'
            });
            this.renderTable();
            await this.saveToAPI();
        });
    }
}

// Initialize the table
new FriendsTable();
