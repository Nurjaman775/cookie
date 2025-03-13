class FriendsTable {
  constructor() {
    this.data = [];
    this.table = document.getElementById("friendsTable");
    this.tbody = this.table.querySelector("tbody");
    this.addButton = document.getElementById("addButton");
    this.API_URL = "https://cookie-4xnu.vercel.app/api/data"; // Ganti dengan URL Vercel yang sesuai
    this.friendModal = new bootstrap.Modal(
      document.getElementById("friendModal")
    );
    this.friendForm = document.getElementById("friendForm");
    this.searchInput = document.getElementById("searchInput");
    this.init();
  }

  async init() {
    await this.loadFromAPI();
    this.addEventListeners();
  }

  async loadFromAPI() {
    try {
      const response = await fetch(this.API_URL);
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      this.data = await response.json();
      console.log("Data loaded from API:", this.data); // Tambahkan logging
      this.renderTable();
    } catch (error) {
      console.error("Error loading data:", error);
      // Fallback ke localStorage jika API gagal
      this.data = JSON.parse(localStorage.getItem("friendsData") || "[]");
      this.renderTable();
      alert("Gagal memuat dari server, menggunakan data lokal");
    }
  }

  async saveToAPI() {
    try {
      const response = await fetch(this.API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(this.data),
      });
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      console.log("Data successfully saved to API"); // Tambahkan logging
      // Backup ke localStorage
      localStorage.setItem("friendsData", JSON.stringify(this.data));
    } catch (error) {
      console.error("Error saving data:", error);
      localStorage.setItem("friendsData", JSON.stringify(this.data));
      alert("Gagal menyimpan ke server, data disimpan lokal");
    }
  }

  renderTable(filteredData = null) {
    this.tbody.innerHTML = "";
    const displayData = filteredData || this.data;
    displayData.forEach((row, index) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${index + 1}</td>
        <td>${row.nim}</td>
        <td>${row.nama}</td>
        <td>${row.kelas}</td>
        <td>${row.prodi}</td>
        <td>${row.alamat}</td>
        <td>
          <button class="btn btn-sm btn-primary edit-btn" data-index="${index}">Edit</button>
          <button class="btn btn-sm btn-danger delete-btn" data-index="${index}">Delete</button>
        </td>
      `;
      this.tbody.appendChild(tr);
    });
  }

  addEventListeners() {
    // Hapus data
    this.tbody.addEventListener("click", async (e) => {
      if (e.target.classList.contains("delete-btn")) {
        const index = e.target.getAttribute("data-index");
        if (confirm("Apakah Anda yakin ingin menghapus data ini?")) {
          this.data.splice(index, 1);
          this.renderTable();
          await this.saveToAPI();
        }
      }
    });

    // Edit data
    this.tbody.addEventListener("click", (e) => {
      if (e.target.classList.contains("edit-btn")) {
        const index = e.target.getAttribute("data-index");
        this.openEditModal(index);
      }
    });

    // Persiapan form untuk tambah data baru
    this.addButton.addEventListener("click", () => {
      this.clearForm();
      document.getElementById("friendModalLabel").textContent = "Tambah Teman";
      document.getElementById("friendIndex").value = "";
    });

    // Submit form untuk tambah/edit data
    this.friendForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const index = document.getElementById("friendIndex").value;
      const friend = {
        nim: document.getElementById("nim").value,
        nama: document.getElementById("nama").value,
        kelas: document.getElementById("kelas").value,
        prodi: document.getElementById("prodi").value,
        alamat: document.getElementById("alamat").value,
      };

      // Validasi input
      if (!this.validateInput("nim", friend.nim)) {
        alert("NIM tidak valid! Harus 9 digit angka.");
        return;
      }
      if (!this.validateInput("nama", friend.nama)) {
        alert("Nama tidak valid! Hanya boleh huruf dan spasi.");
        return;
      }

      if (index === "") {
        // Tambah data baru
        this.data.push(friend);
      } else {
        // Edit data yang sudah ada
        this.data[index] = friend;
      }
      this.renderTable();
      await this.saveToAPI();
      this.friendModal.hide();
    });

    // Fungsi pencarian
    this.searchInput.addEventListener("input", () => {
      const query = this.searchInput.value.toLowerCase();
      const filteredData = this.data.filter((friend) => {
        return (
          friend.nim.toLowerCase().includes(query) ||
          friend.nama.toLowerCase().includes(query) ||
          friend.kelas.toLowerCase().includes(query) ||
          friend.prodi.toLowerCase().includes(query) ||
          friend.alamat.toLowerCase().includes(query)
        );
      });
      this.renderTable(filteredData);
    });
  }

  openEditModal(index) {
    const friend = this.data[index];
    document.getElementById("friendModalLabel").textContent = "Edit Teman";
    document.getElementById("friendIndex").value = index;
    document.getElementById("nim").value = friend.nim;
    document.getElementById("nama").value = friend.nama;
    document.getElementById("kelas").value = friend.kelas;
    document.getElementById("prodi").value = friend.prodi;
    document.getElementById("alamat").value = friend.alamat;
    this.friendModal.show();
  }

  clearForm() {
    this.friendForm.reset();
  }

  validateInput(type, value) {
    switch (type) {
      case "nim":
        return /^\d{9}$/.test(value);
      case "nama":
        return /^[A-Za-z\s]+$/.test(value);
      default:
        return true;
    }
  }
}

// Inisialisasi tabel
new FriendsTable();
