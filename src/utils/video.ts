interface IVideo {
  id: string;
  room: string;
}

class Video {
  private videos: IVideo[];

  constructor() {
    this.videos = [];
  }

  addVideo(id: string, room: string) {
    let video = { id, room };
    this.videos.push(video);
    return video;
  }

  getVideo(room: string) {
    return this.videos.filter((video) => video.room === room)[0];
  }

  removeVideo(room: string) {
    let video = this.getVideo(room);

    if (video) {
      this.videos = this.videos.filter((video) => video.room !== room);
    }

    return video;
  }
}

module.exports = Video;
