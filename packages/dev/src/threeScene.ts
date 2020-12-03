import { Project, Scene3D, PhysicsLoader, ExtendedObject3D } from 'enable3d'
import {
  SpotLight,
  SpotLightHelper,
  PointLight,
  DirectionalLight,
  Vector3,
  PlaneBufferGeometry,
  MeshLambertMaterial,
  Mesh,
  RepeatWrapping,
  DoubleSide
} from '../../threeWrapper/dist'

const isTouchDevice = 'ontouchstart' in window

class MainScene extends Scene3D {
  cloth: Mesh
  ball: ExtendedObject3D

  async create() {
    const { orbitControls } = await this.warpSpeed()
    orbitControls?.target.set(0, 2.5, 0)
    this.camera.lookAt(0, 2.5, 0)

    // enable physics debugging
    this.physics.debug?.enable()

    // ball
    this.ball = this.physics.add.sphere({ x: 5, y: 2, collisionFlags: 2 })

    // bar
    const bar = this.add.cylinder({ y: 5, height: 5, radiusTop: 0.1, radiusBottom: 0.1 })
    bar.rotateX(Math.PI / 2)
    this.physics.add.existing(bar, { collisionFlags: 1, mass: 0 })

    // The cloth
    // Cloth graphic object
    const clothWidth = 4
    const clothHeight = 3
    const clothNumSegmentsZ = clothWidth * 5
    const clothNumSegmentsY = clothHeight * 5
    const clothPos = new Vector3(0, 2, 2)

    const clothGeometry = new PlaneBufferGeometry(clothWidth, clothHeight, clothNumSegmentsZ, clothNumSegmentsY)
    clothGeometry.rotateY(Math.PI * 0.5)
    clothGeometry.translate(clothPos.x, clothPos.y + clothHeight * 0.5, clothPos.z - clothWidth * 0.5)

    const clothMaterial = new MeshLambertMaterial({ color: 0xffffff, side: DoubleSide })
    this.cloth = new Mesh(clothGeometry, clothMaterial)
    this.cloth.castShadow = true
    this.cloth.receiveShadow = true
    this.scene.add(this.cloth)

    this.load.texture('assets/grid.png').then(texture => {
      texture.wrapS = RepeatWrapping
      texture.wrapT = RepeatWrapping
      texture.repeat.set(clothNumSegmentsZ, clothNumSegmentsY)
      // @ts-ignore
      this.cloth.material.map = texture
      // @ts-ignore
      this.cloth.material.needsUpdate = true
    })

    // Cloth physic object
    const softBodyHelpers = new Ammo.btSoftBodyHelpers()
    const clothCorner00 = new Ammo.btVector3(clothPos.x, clothPos.y + clothHeight, clothPos.z)
    const clothCorner01 = new Ammo.btVector3(clothPos.x, clothPos.y + clothHeight, clothPos.z - clothWidth)
    const clothCorner10 = new Ammo.btVector3(clothPos.x, clothPos.y, clothPos.z)
    const clothCorner11 = new Ammo.btVector3(clothPos.x, clothPos.y, clothPos.z - clothWidth)
    const clothSoftBody = softBodyHelpers.CreatePatch(
      this.physics.physicsWorld.getWorldInfo(),
      clothCorner00,
      clothCorner01,
      clothCorner10,
      clothCorner11,
      clothNumSegmentsZ + 1,
      clothNumSegmentsY + 1,
      0,
      true
    )
    const sbConfig = clothSoftBody.get_m_cfg()
    sbConfig.set_viterations(10)
    sbConfig.set_piterations(10)

    clothSoftBody.setTotalMass(0.9, false)
    // @ts-ignore
    Ammo.castObject(clothSoftBody, Ammo.btCollisionObject).getCollisionShape().setMargin(0.04)
    this.physics.physicsWorld.addSoftBody(clothSoftBody, 1, -1)
    this.cloth.userData.physicsBody = clothSoftBody
    // Disable deactivation
    clothSoftBody.setActivationState(4)

    // Glue the cloth to the bar
    const influence = 0.5
    clothSoftBody.appendAnchor(0, bar.body.ammo, false, influence)
    clothSoftBody.appendAnchor(clothNumSegmentsZ, bar.body.ammo, false, influence)
  }

  update(time: number) {
    // update ball
    this.ball.position.x -= Math.sin(time) * 0.1
    this.ball.body.needUpdate = true

    // update cloth
    const softBody = this.cloth.userData.physicsBody
    // @ts-ignore
    const clothPositions = this.cloth.geometry.attributes.position.array
    const numVerts = clothPositions.length / 3
    const nodes = softBody.get_m_nodes()
    let indexFloat = 0

    for (let i = 0; i < numVerts; i++) {
      const node = nodes.at(i)
      const nodePos = node.get_m_x()
      clothPositions[indexFloat++] = nodePos.x()
      clothPositions[indexFloat++] = nodePos.y()
      clothPositions[indexFloat++] = nodePos.z()
    }

    this.cloth.geometry.computeVertexNormals()
    // @ts-ignore
    this.cloth.geometry.attributes.position.needsUpdate = true
    // @ts-ignore
    this.cloth.geometry.attributes.normal.needsUpdate = true
  }
}

const startProject = () => {
  PhysicsLoader('/lib', () => new Project({ scenes: [MainScene] }))
}

export default startProject
