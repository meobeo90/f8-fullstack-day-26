const player = {
  NEXT: 1,
  PREV: -1,
  playList: document.querySelector(".playlist"),
  songTitle: document.querySelector(".song-title"),
  cdImg: document.querySelector(".cd-thumb"),
  audio: document.querySelector("#audio"),
  togglePlayBtn: document.querySelector(".btn-toggle-play"),
  btnPrev: document.querySelector(".btn-prev"),
  btnNext: document.querySelector(".btn-next"),
  progress: document.querySelector(".progress"),
  repeatBtn: document.querySelector(".btn-repeat"),
  shuffleBtn: document.querySelector(".btn-random"),
  cd: document.querySelector(".cd"),

  isSeeking: false,
  isRepeat: localStorage.getItem("isRepeat") === "true",
  isShuffle: localStorage.getItem("isShuffle") === "true",
  shuffleSongsList: [],
  shuffleIndex: 0,

  songs: [
    {
      id: 1,
      name: "Còn Gì Đẹp Hơn (Mưa Đỏ Original Soundtrack)",
      path: "./musics/Còn Gì Đẹp Hơn (Mưa Đỏ Original Soundtrack).mp3",
      artist: "Nguyễn Hùng",
      img: "./img/id_1_img.jpg",
    },
    {
      id: 2,
      name: "Ngàn Ước Mơ Việt Nam",
      path: "./musics/Ngàn Ước Mơ Việt Nam.mp3",
      artist: "Trần Phương Mai",
      img: "./img/id_2_img.jpg",
    },
    {
      id: 3,
      name: "Nỗi Đau Giữa Hòa Bình",
      path: "./musics/Nỗi Đau Giữa Hòa Bình.mp3",
      artist: "Hòa Minzy",
      img: "./img/id_3_img.jpg",
    },
    {
      id: 4,
      name: "Viết Tiếp Câu Chuyện Hòa Bình",
      path: "./musics/Viết Tiếp Câu Chuyện Hòa Bình.mp3",
      artist: "Nguyễn Văn Chung, Nguyễn Duyên Quỳnh",
      img: "./img/id_4_img.jpg",
    },
  ],
  currentIndex: 0,
  getCurrentSong() {
    return this.songs[this.currentIndex];
  },
  loadCurrentSong() {
    const currentSong = this.getCurrentSong();
    this.songTitle.textContent = currentSong.name;
    this.cdImg.style.backgroundImage = `url(${currentSong.img})`;
    this.audio.src = currentSong.path;
  },
  handleEvents() {
    this.playList.addEventListener("click", (e) => {
      const songNode = e.target.closest(".song:not(.active)");
      if (songNode) {
        this.isShuffle = false;
        this.shuffleBtn.classList.remove("active");
        localStorage.setItem("isShuffle", false);
        const clickedIndex = Number(songNode.dataset.index);
        this.currentIndex = clickedIndex;
        this.loadCurrentSong();
        this.audio.play();
        this.render();
        localStorage.setItem("currentIndex", this.currentIndex);
      }
    });
  },

  changeSong(step) {
    if (this.isShuffle) {
      this.shuffleIndex += step;
      if (this.shuffleIndex >= this.shuffleSongsList.length) {
        this.createShuffleSongsList();
        this.shuffleIndex = 0;
      } else if (this.shuffleIndex < 0) {
        this.shuffleIndex = this.shuffleSongsList.length - 1;
      }
      this.currentIndex = this.shuffleSongsList[this.shuffleIndex];
    } else {
      this.currentIndex =
        (this.currentIndex + step + this.songs.length) % this.songs.length;
    }
    this.loadCurrentSong();
    this.audio.play();
    this.render();
    localStorage.setItem("currentIndex", this.currentIndex);
  },

  init() {
    // Đọc chỉ mục hiện tại từ localStorage, nếu không có thì mặc định là 0
    const savedIndex = localStorage.getItem("currentIndex");
    if (savedIndex !== null) {
      this.currentIndex = Number(savedIndex);
    }

    // Khởi tạo trạng thái shuffle/repeat
    this.isShuffle = localStorage.getItem("isShuffle") === "true";
    this.isRepeat = localStorage.getItem("isRepeat") === "true";

    // Cập nhật trạng thái nút và giao diện
    this.shuffleBtn.classList.toggle("active", this.isShuffle);
    this.repeatBtn.classList.toggle("active", this.isRepeat);

    // Nếu chế độ shuffle đang bật, đồng bộ lại shuffleIndex
    if (this.isShuffle) {
      this.createShuffleSongsList();
      const indexInShuffle = this.shuffleSongsList.indexOf(this.currentIndex);
      if (indexInShuffle !== -1) {
        [this.shuffleSongsList[0], this.shuffleSongsList[indexInShuffle]] = [
          this.shuffleSongsList[indexInShuffle],
          this.shuffleSongsList[0],
        ];
      }
      this.shuffleIndex = 0;
    }
    this.loadCurrentSong();

    this.togglePlayBtn.addEventListener("click", () => {
      if (this.audio.paused) {
        this.audio.play();
      } else {
        this.audio.pause();
      }
    });

    this.audio.addEventListener("play", () => {
      this.togglePlayBtn.classList.add("playing");
      this.cd.classList.add("playing");
      this.cd.style.animationPlayState = "running";
    });
    this.audio.addEventListener("pause", () => {
      this.togglePlayBtn.classList.remove("playing");
      this.cd.style.animationPlayState = "paused";
    });

    this.btnNext.addEventListener("click", () => {
      this.changeSong(this.NEXT);
    });
    this.btnPrev.addEventListener("click", () => {
      if (this.audio.currentTime > 2) {
        this.audio.currentTime = 0;
      } else {
        this.changeSong(this.PREV);
      }
    });

    this.audio.addEventListener("timeupdate", () => {
      const { duration, currentTime } = this.audio;
      if (!duration || this.isSeeking) return;
      this.progress.value = (currentTime / duration) * 100;
    });
    this.progress.addEventListener("mousedown", () => {
      this.isSeeking = true;
    });
    this.progress.addEventListener("mouseup", (e) => {
      this.isSeeking = false;
      const nextProgress = e.target.value;
      const nextDuration = (nextProgress / 100) * this.audio.duration;
      this.audio.currentTime = nextDuration;
    });

    this.audio.addEventListener("ended", () => {
      if (this.isRepeat) {
        this.audio.play();
      } else {
        this.changeSong(this.NEXT);
      }
    });

    this.repeatBtn.addEventListener("click", () => {
      this.isRepeat = !this.isRepeat;
      this.repeatBtn.classList.toggle("active", this.isRepeat);
      localStorage.setItem("isRepeat", this.isRepeat);
    });

    this.shuffleBtn.addEventListener("click", () => {
      this.isShuffle = !this.isShuffle;
      this.shuffleBtn.classList.toggle("active", this.isShuffle);
      localStorage.setItem("isShuffle", this.isShuffle);
      if (this.isShuffle) {
        // Tạo danh sách ngẫu nhiên mới
        this.createShuffleSongsList();
        // Tìm chỉ mục của bài hát hiện tại trong danh sách ngẫu nhiên
        const currentSongIndexInShuffle = this.shuffleSongsList.indexOf(
          this.currentIndex
        );
        // Hoán đổi vị trí của bài hát hiện tại với bài hát đầu tiên trong danh sách ngẫu nhiên
        if (currentSongIndexInShuffle > 0) {
          [
            this.shuffleSongsList[0],
            this.shuffleSongsList[currentSongIndexInShuffle],
          ] = [
            this.shuffleSongsList[currentSongIndexInShuffle],
            this.shuffleSongsList[0],
          ];
        }
        // Đặt lại chỉ mục ngẫu nhiên về 0 để bắt đầu từ bài hát hiện tại
        this.shuffleIndex = 0;
      } else {
        // Khi tắt shuffle, tìm lại chỉ mục của bài hát hiện tại trong mảng gốc
        this.currentIndex = this.songs.indexOf(this.getCurrentSong());
      }
      this.render();
    });

    this.render();
    this.handleEvents();
  },

  createShuffleSongsList() {
    this.shuffleSongsList = this.songs.map((_, i) => i);
    for (let i = this.shuffleSongsList.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.shuffleSongsList[i], this.shuffleSongsList[j]] = [
        this.shuffleSongsList[j],
        this.shuffleSongsList[i],
      ];
    }
  },
  render() {
    const htmlContent = this.songs
      .map((song, index) => {
        return `
      <div class="song ${
        this.currentIndex === index ? "active" : ""
      }" data-index="${index}">
          <div class="thumb" style="background-image: url(${song.img})"></div>
          <div class="body">
            <h3 class="title">${song.name}</h3>
            <p class="author">${song.artist}</p>
          </div>
          <div class="option">
            <i class="fa-solid fa-ellipsis"></i>
          </div>
        </div>
`;
      })
      .join("");
    this.playList.innerHTML = htmlContent;
  },
};

player.init();
