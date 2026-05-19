class RoomScene extends Phaser.Scene {
  constructor() {
    super("room");
  }

  create() {
    // player
    this.player = this.add.rectangle(100, 100, 30, 30, 0x00ffff);
    this.physics.add.existing(this.player);
    this.player.body.setCollideWorldBounds(true);

    // inactive objects
    this.add.rectangle(200, 250, 40, 40, 0xff8800);
    this.add.rectangle(450, 150, 40, 40, 0xff8800);

    // objects
    this.objects = [];

    this.createObject({
      x: 300,
      y: 200,
      name: "Book",
      description: "A worn leather-bound book titled 'The Last Lighthouse'.",
      takeable: true,
    });
    this.createObject({
      x: 600,
      y: 350,
      name: "Mirror",
      text: "**Looks back at you**"
    });

    // dialogue and inventory panels
    this.dialogue = document.getElementById("dialogue-window");
    this.inventoryWindow = document.getElementById("inventory-items");
    this.inventory = [];
    this.addToDialogue("Sir Reginald, the Cat", "Good morning, sunshine!");
    this.updateInventory();

    // input
    this.cursors = this.input.keyboard.addKeys({
      w: "up",
      a: "left",
      s: "down",
      d: "right",
      e: "enter",
      h: "H",
      t: "T",
      esc: Phaser.Input.Keyboard.KeyCodes.ESC,
    });

    this.inventory = [];
  }

  createObject({ x, y, name, text, description, takeable = false }) {
    const obj = this.add.rectangle(x, y, 40, 40, 0xff8800);
    obj.name = name;
    obj.takeable = takeable;
    obj.description = description;
    if (text) obj.interactionText = text;

    this.physics.add.existing(obj, true);
    this.objects.push(obj);
  }

  update() {
    const speed = 150;
    const body = this.player.body;

    body.setVelocity(0);

    if (this.cursors.w.isDown) body.setVelocityY(-speed);
    if (this.cursors.s.isDown) body.setVelocityY(speed);
    if (this.cursors.a.isDown) body.setVelocityX(-speed);
    if (this.cursors.d.isDown) body.setVelocityX(speed);
    if (this.cursors.h.isDown) {
      for (let obj of this.objects) {
        obj.fillColor = 0xfff01f;
      }
    }

    let near = null;

    for (let obj of this.objects) {
      const dist = Phaser.Math.Distance.Between(
        this.player.x,
        this.player.y,
        obj.x,
        obj.y,
      );

      if (dist < 70) {
        obj.fillColor = 0x00ff00;
        near = obj;
      } else if (this.cursors.h.isUp) {
        obj.fillColor = 0xff8800;
      }
    }

    if (Phaser.Input.Keyboard.JustDown(this.cursors.e) && near) {
      this.addToDialogue(near.name, near.interactionText);
      near.discovered = true;
    }

    if (Phaser.Input.Keyboard.JustDown(this.cursors.t) && near && near.discovered && near.takeable) {
      this.take(near);
    }
  }

  take(obj) {
    this.inventory.push(obj.name);
    this.updateInventory();
    this.addToDialogue("Inventory", `${obj.name} added.`);
    this.objects = this.objects.filter((item) => item.name !== obj.name);
    obj.destroy();
  }

  updateInventory() {
    if (!this.inventoryWindow) return;
    if (this.inventory.length === 0) {
      this.inventoryWindow.textContent = "No items";
      return;
    }
    this.inventoryWindow.innerHTML = this.inventory
      .map((item) => `- ${item}`)
      .join("<br>");
  }

  addToDialogue(speaker, text) {
    if (this.dialogue) {
      const fullText = text ? `${speaker}: ${text}` : speaker;
      this.dialogue.textContent = this.dialogue.textContent
        ? this.dialogue.textContent + "\n" + fullText
        : fullText;
      this.dialogue.scrollTop = this.dialogue.scrollHeight;
    }
  }
}

const config = {
  type: Phaser.AUTO,
  parent: "game-container",
  width: 800,
  height: 600,
  backgroundColor: "#111111",
  physics: {
    default: "arcade",
    arcade: {
      debug: false,
    },
  },
  scene: RoomScene,
};

new Phaser.Game(config);
