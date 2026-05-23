import { MorseViewModel } from '../morse'
import roomTemplate from './roomAccordion.html'
class RoomAccordion {
  vm:MorseViewModel
  constructor (params) {
    this.vm = params.root
  }
}
export default { viewModel: RoomAccordion, template: roomTemplate }
