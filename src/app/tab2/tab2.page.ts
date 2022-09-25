import { Component, OnInit } from '@angular/core';
import { Directory, Filesystem } from '@capacitor/filesystem';
import { AlertController, ToastController } from '@ionic/angular';
import { RecordingData, VoiceRecorder } from 'capacitor-voice-recorder';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page implements OnInit {
  isRecording = false;
  playingAudio = false;
  isLooping = true;
  currentAudioRef;
  storedFileNames = [];

  constructor(private toastController: ToastController, private alertController: AlertController) {}

  async presentAlert(_header: string, _subheader: string, _message: string, callback: any, callbackParams: any, object: any) {
    const alert = await this.alertController.create({
      header: _header,
      message: _message,
      subHeader: _subheader,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'OK',
          role: 'confirm',
          handler: () => {
            callback(object, callbackParams);
          },
        },
      ],
    });

    await alert.present();
  }

  async presentToast(_message: string, _duration: number = 1500, _icon: string = 'close') {
    const toast = await this.toastController.create({
      message: _message,
      duration: _duration,
      position: 'bottom',
      icon: _icon
    });

    await toast.present();
  }

  startRecording() {
    VoiceRecorder.startRecording();
  }

  stopRecording() {
    VoiceRecorder.stopRecording().then(async (result: RecordingData) => {
      if (result.value && result.value.recordDataBase64) {
        const recordData = result.value.recordDataBase64;
        const fileName = new Date().getTime() + '.wav';
        await Filesystem.writeFile({
          path: fileName,
          directory: Directory.Data,
          data: recordData
        });
        this.loadFiles();
      }
    });
  }

  setRecording() {
    if (VoiceRecorder.canDeviceVoiceRecord) {
      this.isRecording = !this.isRecording;
      if (this.isRecording) {
        this.startRecording();
      }
      else {
        this.stopRecording();
      }
    } else {
      this.presentToast(`InTune doesn't have the permission to record audio, please change our permissions under settings!`, 1500);
    }
  }

  async loadFiles() {
    Filesystem.readdir({
      path: '',
      directory: Directory.Data
    }).then(result => {
      console.log(result);
      this.storedFileNames = result.files;
    });
  }

  ngOnInit() {
    this.loadFiles();
    VoiceRecorder.requestAudioRecordingPermission();
    this.playingAudio = false;
  }

  async deleteFile(object, fileData) {
    const fileName = fileData.name;
    const index = object.storedFileNames.indexOf(fileData);
    Filesystem.deleteFile({
      path: fileName,
      directory: Directory.Data
    });
    object.storedFileNames.splice(index, 1);
    object.presentToast(`${fileName} has been permanently deleted.`, 1500, 'trash');
  }

  async promptFileDeletal(fileData) {
    const fileName = fileData.name;
    this.presentAlert('Delete audio?', fileName, 'This action cannot be undone.', this.deleteFile, fileData, this);
  }

  async playFile(fileData, loopingData: any | null) {
    const fileName = fileData.name;
    if (this.playingAudio && this.playingAudio !== fileName) {
      if (this.currentAudioRef) {
        this.currentAudioRef.pause();
      }
    } else if (this.playingAudio && this.playingAudio === fileName && !loopingData) {
      if (this.currentAudioRef) {
        this.currentAudioRef.pause();
      }
      this.playingAudio = false;
      return;
    }
    const audioFile = await Filesystem.readFile({
      path: fileName,
      directory: Directory.Data,
    });
    const base64Sound = audioFile.data;
    const audioRef = new Audio(`data:audio/aac;base64,${base64Sound}`);
    this.currentAudioRef = audioRef;
    audioRef.oncanplaythrough = () => {
      this.playingAudio = fileName;
      audioRef.play();
    };
    audioRef.onended = () => {
      if (this.isLooping === false) {
        this.playingAudio = false;
        this.currentAudioRef = null;
      } else {
        this.playFile(fileData, true);
      }
    };
    audioRef.load();
  }

}
