"use strict";
class Video {
    constructor() {
        this.videos = [];
    }
    addVideo(id, room) {
        let video = { id, room };
        this.videos.push(video);
        return video;
    }
    getVideo(room) {
        return this.videos.filter((video) => video.room === room)[0];
    }
    removeVideo(room) {
        let video = this.getVideo(room);
        if (video) {
            this.videos = this.videos.filter((video) => video.room !== room);
        }
        return video;
    }
}
module.exports = Video;
