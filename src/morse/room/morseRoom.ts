import ko from 'knockout'
import { ref, get, set, onDisconnect, serverTimestamp } from 'firebase/database'
import { signInAnonymously } from 'firebase/auth'
import { db, auth } from './roomConfig'
import MorseSettingsHandler from '../settings/morseSettingsHandler'
import { MorseViewModel } from '../morse'

// Unambiguous alphabet (no O/0, I/1/L). 5 chars ~= 28M combinations.
const CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'
const CODE_LENGTH = 5

export class MorseRoom {
  vm:MorseViewModel
  roomCode:ko.Observable<string> = ko.observable('')
  joinCodeInput:ko.Observable<string> = ko.observable('')
  isHost:ko.Observable<boolean> = ko.observable(false)
  status:ko.Observable<string> = ko.observable('')
  busy:ko.Observable<boolean> = ko.observable(false)
  uid:string = null

  constructor (vm:MorseViewModel) {
    this.vm = vm
  }

  private generateCode = ():string => {
    let c = ''
    for (let i = 0; i < CODE_LENGTH; i++) {
      c += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)]
    }
    return c
  }

  private ensureSignedIn = async ():Promise<string> => {
    if (this.uid) return this.uid
    const cred = await signInAnonymously(auth)
    this.uid = cred.user.uid
    return this.uid
  }

  createRoom = async () => {
    try {
      this.busy(true)
      this.status('Creating room...')
      await this.ensureSignedIn()

      // RTDB rejects undefined values; round-trip to drop them.
      const settings = JSON.parse(JSON.stringify(MorseSettingsHandler.getCurrentSerializedSettings(this.vm)))

      // Low-concurrency POC: pick a code and check it's free.
      let code = ''
      for (let tries = 0; tries < 5; tries++) {
        code = this.generateCode()
        const snap = await get(ref(db, `rooms/${code}/meta`))
        if (!snap.exists()) break
      }

      const roomRef = ref(db, `rooms/${code}`)
      await set(roomRef, {
        meta: { owner: this.uid, createdAt: serverTimestamp() },
        settings
      })
      // Tear the room down when the host's tab closes.
      onDisconnect(roomRef).remove()

      this.roomCode(code)
      this.isHost(true)
      this.status(`Room ${code} is live — share this code.`)
    } catch (e) {
      this.status(`Error creating room: ${e.message || e}`)
    } finally {
      this.busy(false)
    }
  }

  joinRoom = async () => {
    try {
      this.busy(true)
      const code = (this.joinCodeInput() || '').trim().toUpperCase()
      if (code.length !== CODE_LENGTH) {
        this.status(`Enter a ${CODE_LENGTH}-character code.`)
        return
      }
      this.status(`Joining ${code}...`)
      await this.ensureSignedIn()

      const snap = await get(ref(db, `rooms/${code}/settings`))
      if (!snap.exists()) {
        this.status(`Room ${code} not found.`)
        return
      }
      MorseSettingsHandler.applyLoadedSettings(this.vm, snap.val(), `Room ${code}`)

      this.roomCode(code)
      this.isHost(false)
      this.status(`Joined room ${code} — instructor settings loaded.`)
    } catch (e) {
      this.status(`Error joining: ${e.message || e}`)
    } finally {
      this.busy(false)
    }
  }
}
