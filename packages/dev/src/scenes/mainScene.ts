import { Scene3D, ExtendedObject3D, THREE } from '@enable3d/phaser-extension'

class MainScene extends Scene3D {
  box: ExtendedObject3D
  rect: Phaser.GameObjects.Rectangle
  initialDistance: number

  init() {
    this.accessThirdDimension()
  }

  create() {
    this.third.warpSpeed()

    this.box = this.third.physics.add.box({ y: 5, x: 2 })
    this.rect = this.add.rectangle(0, 0, 50, 50, 0xff00ff)

    let distance = this.third.camera.position.distanceTo(this.box.position)
    this.rect.setData('initialDistance', distance)
  }

  update() {
    // adjust the size of the rect
    let distance = this.third.camera.position.distanceTo(this.box.position)
    let size = this.rect.getData('initialDistance') / distance
    this.rect.setScale(size)

    // adjust position of the rect
    let pos = this.third.transform.from3dto2d(this.box.position)
    this.rect.setPosition(pos.x, pos.y)
  }
}

// class MainScene extends Scene3D {
//   box: ExtendedObject3D
//   rect: Phaser.GameObjects.Rectangle

//   init() {
//     this.accessThirdDimension()
//   }

//   async create() {
//     await this.third.warpSpeed()

//     this.rect = this.add.rectangle(this.cameras.main.width / 2, this.cameras.main.height / 2, 50, 50, 0xff00ff, 0.5)

//     this.box = this.third.add.box()

//     // adjust position of box with mouse click (will be over written by update())
//     window.addEventListener('pointerdown', async (event: PointerEvent) => {
//       const canvas = this.third.renderer.domElement.getBoundingClientRect()
//       const mouseX = event.clientX - canvas.left
//       const mouseY = event.clientY - canvas.top

//       const x = (mouseX / canvas.width) * 2 - 1
//       const y = -(mouseY / canvas.height) * 2 + 1

//       const position = this.third.transform.from2dto3d(x, y, 10)
//       if (position) {
//         const { x, y, z } = position
//         this.box.position.set(x, y, z)
//       }
//     })
//   }

//   update(time: number) {
//     if (!this.rect) return

//     const speed = 6
//     const angle = time / 800
//     const direction = { x: Math.cos(angle), y: Math.sin(angle) }
//     this.rect.x += speed * direction.x
//     this.rect.y += speed * direction.y

//     // normalize values
//     const x = (this.rect.x / this.cameras.main.width) * 2 - 1
//     const y = -(this.rect.y / this.cameras.main.height) * 2 + 1

//     const position = this.third.transform.from2dto3d(x, y, 10)
//     if (position) {
//       const { x, y, z } = position
//       this.box.position.set(x, y, z)
//     }
//   }
// }

export default MainScene
