<template>

  <div id="leftArea">

    <div class="switchTab">
      <div class="private" @click="switchPrivate()">
        メッセージ
      </div>
      <div class="global" @click="switchGlobal()">
        グローバル
      </div>
    </div>

    <div class="privateDM">
      <div class="dmbannerPosition">
        <div v-for="(friend, N) in friendsDocID"
             :key="N" v-bind:class="'b' + N">
          <div @click="click_f(friend, N)">
            <dmBanner
              :dmBannerUsername="usernames[N]"
              :dmMsg="lastMsg[N]"
              :iconPic="dmImages[N]">
            </dmBanner>
          </div>
        </div>
      </div>

    </div>

    <div class="globalDM">
      <div class="dmBannerPosition">
        <div v-for="(game, N) in games"
          :key="N" v-bind:class="'enumGameBanner'+N">
          <div @click="click_g(game, N)">
            <dmGameBanner
              :gameDocId="game">
            </dmGameBanner>
          </div>
        </div>
      </div>

      <div class="addGamePosition">
        <div class="textPosition" @click="showPopup()">
        New Game
        </div>
      </div>
    </div>

  </div>

</template>

<script>
// directMessageFieldからフレンドのIDを受け取ってleftareaの内容を表示する
import dmBanner from'./dmBanner.vue';
import dmGameBanner from "./dmGameBanner.vue";

import firebase from '../../plugin/firestore';
import 'firebase/firestore'
import '@firebase/auth'
import store from '../../store'

import draggable from 'vuedraggable';

let db = firebase.firestore();

let currentUserEmail;
let lastMsgDate = [];

let privateDM, globalDM;
let privateTab, globalTab;

export default {

  name: 'LeftArea',

  data() {
    return {
      friends: '',
      lastMsg: [],
      usernames: [],
      dmImages: [],
      isPrivate: true,
      target:[],
      id:0,
      games: []
    }
  },

  props: [
    'friendsDocID'
  ],

  components: {
    dmBanner,
    dmGameBanner
  },

  watch: {
    friendsDocID: function() {
        if(this.id != 0){
          let username = this.usernames[this.id];
          let icon = this.dmImages[this.id];
          this.usernames.splice(this.id,1);
          this.dmImages.splice(this.id,1);
          this.target.splice(this.id,1);
          this.usernames.unshift(username);
          this.dmImages.unshift(icon);
          this.target.unshift(true);
        }


    }
  },

  methods: {
    onAuth: function() {
      firebase.auth().onAuthStateChanged(user => {
        user = user ? user : {};
        store.commit('onAuthStateChanged', user);
        store.commit('onUserStatusChanged', user.uid ? true : false);
      })
    },

    // 最後にメッセージが送信された日時とその内容を取得する
    // TODO: returnできるようにする
    loadLastMsgAndDate: function() {
      db.collection("USER")
        .doc(currentUserEmail)
        .collection('friends')
        .orderBy('lastChatDate', 'desc')
        .get()
        .then(friendsSnapshot => {

          friendsSnapshot.forEach(doc1 => {

            db.collection("USER")
              .doc(doc1.data().email)
              .get()
              .then(doc2 => {
                this.usernames.push(doc2.data().username);
                this.dmImages.push(doc2.data().image)
              });

            db.collection("PrivateChat")
              .doc(currentUserEmail + doc1.id)
              .collection('contents')
              .orderBy('date')
              .limit(1)
              .get()
              .then(contentsSnapshot => {
                contentsSnapshot.forEach(doc2 => {
                  this.lastMsg.push(doc2.data().msg);
                  lastMsgDate.push(doc2.data().date);
                })
              })
            })
      })
    },


    click_f: function(friend,N) {
      this.$parent.idFromLeftArea = friend;

      let dmBan = document.getElementsByClassName("dmBanner")[this.id]
      dmBan.style.background = "#FFF"
      this.id = N;
      dmBan = document.getElementsByClassName("dmBanner")[N]
      dmBan.style.background = "red"

      this.$parent.isGame = false;
    },

    click_g: function(game,N) {
      this.$parent.idFromLeftArea = game;
      
      let gameBan = document.getElementsByClassName("dmGameBanner")[this.id]
      gameBan.style.background = "#FFF"
      this.id = N;
      gameBan = document.getElementsByClassName("dmGameBanner")[N]
      gameBan.style.background = "red";

      this.$parent.isGame = true;
    },

    switchPrivate: function() {
      privateDM[0].style.display = "block";
      globalDM[0].style.display = "none";

      privateTab[0].style.background = "#b2ebf2";
      globalTab[0].style.background = "#fff";

      let dmBan = document.getElementsByClassName("dmBanner")[this.id]
      dmBan.style.background = "#FFF"
    },

    switchGlobal: function() {
      privateDM[0].style.display = "none";
      globalDM[0].style.display = "block";

      privateTab[0].style.background = "#fff";
      globalTab[0].style.background = "#b2ebf2"

      let gameBan = document.getElementsByClassName("dmGameBanner")[this.id]
      gameBan.style.background = "#FFF"
    },

    showPopup: function() {
      this.$emit("showPopup");
    }
  },

  created: function() {
    this.onAuth();
    console.log("leftarea created");
    currentUserEmail = firebase.auth().currentUser.email;
    this.loadLastMsgAndDate();
    for(let i=0;i<this.friendsDocID.length;i++){this.target.push(false)}

    db.collection("USER")
        .doc(currentUserEmail)
        .collection("GAMES")
        .get()
        .then(querySnapshot => {

          querySnapshot.forEach(doc1 => {
            this.games.push(doc1.id);
          })
        })
  },

  mounted: function() {
    privateDM = document.getElementsByClassName("privateDM");
    globalDM = document.getElementsByClassName("globalDM");
    privateTab = document.getElementsByClassName("private");
    globalTab = document.getElementsByClassName("global");
  }
}

</script>

<style lang='scss' scoped>
  #leftArea {

    position: absolute;
    top: 0;
    left: 0;

    height: 100%;
    width: 40%;

    background-color: #b2ebf2;

    .switchTab {
      .private {
        position: absolute;

        background: #b2ebf2;

        // TODO: note in a SCSS file
        width: 50%;
        height: 90px;

        font-size: 40px;
        line-height: 90px;

        cursor: pointer;
      }

      .global {
        position: absolute;

        // TODO: color
        background: #fff;

        width: 50%;
        height: 90px;

        right: 0;

        font-size: 40px;
        line-height: 90px;

        cursor: pointer;
      }
    }

    .privateDM {
      overflow-y: scroll;
      overflow-x: hidden;

      position: absolute;

      top: 90px;
      left: 0;

      width: 100%;
      height: calc(100% - 90px);

      .dmbannerPosition{
        position: absolute;

        $i: 1;

        top: 70px;
        left: 6%;

        width: 100%;

        float:left;

        @while $i <= 30{
          .b#{$i}{
            position: absolute;

            top: 140px * $i;

            width: 100%;
          }
          $i: $i + 1;
        }

        /*.notion{
          border:1px solid #000;
        }*/

      }

    }

    .globalDM {
      display: none;

      overflow-y: scroll;
      overflow-x: hidden;

      position: absolute;

      top: 90px;
      left: 0;

      width: 100%;
      height: calc(100% - 150px);

      .dmBannerPosition {
        position: absolute;

        width: 88%;
        height: auto;

        left: 6%;
        top: 70px;

        .enumGameBanner {
          position: relative;

          top: 20px;
        }
      }

      .addGamePosition {
        position: fixed;

        bottom: 0;
        left: 0;

        height: 60px;
        width: 100%;

        .textPosition {
          position: absolute;

          width: 100%;
          height: 100%;

          top: 0;
          left: 0;

          font-size: 40px;
          color: $primary_text;

          background-color: $accent_color;

          text-align: center;

          cursor: pointer;
        }
      }
    }
  }

</style>
