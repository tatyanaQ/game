const mirrorDialogue = {
  speaker: "Mirror",
  text: "**Looks back at you**",
  options: [
    {
      text: "What's up?",
      response: "Just reflecting on things, as always.",
    },
    {
      text: "Do you want to hang out sometime?",
      response: "I'd like that. We can have some deep conversations about existence.",
    },
    {
      text: "What do you think of the book I found?",
      response: "Ah, 'The Last Lighthouse'... A tale of solitude and hope. It resonates with me. Keep it close.",
      requiresItem: "Book",
    },
    {
      text: "See you later.",
      response: "Take care! I'll be here whenever you want to chat.",
      isFinal: true,
    },
  ],
};

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
      text: "**Looks back at you**",
      dialogue: mirrorDialogue,
    });

    // dialogue and inventory panels
    this.dialogue = document.getElementById("dialogue-window");
    this.inventoryWindow = document.getElementById("inventory-items");
    this.inventory = [];
    this.dialogueHistory = [];
    this.dialogueActive = false;
    this.dialogueOptions = [];
    this.dialogueSpeaker = "";

    if (this.dialogue) {
      this.dialogue.addEventListener("click", (event) => {
        const optionEl = event.target.closest(".dialogue-option");
        if (!optionEl) return;
        const index = Number(optionEl.dataset.index);
        if (Number.isFinite(index)) {
          this.handleDialogueChoice(index);
        }
      });
    }

    this.addToDialogue("Sir Reginald, the Cat", "Good morning, sunshine!");
    this.updateInventory();

    this.inventoryWindow.addEventListener("click", (event) => {
      const item = event.target.closest(".inventory-item");
      if (!item) return;
      const index = Number(item.dataset.index);
      if (Number.isFinite(index)) {
        this.toggleInventory(index);
      }
    });

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
  }

  createObject({
    x,
    y,
    name,
    text,
    description,
    takeable = false,
    dialogue = null,
  }) {
    const obj = this.add.rectangle(x, y, 40, 40, 0xff8800);
    obj.name = name;
    obj.takeable = takeable;
    obj.description = description;
    if (text) obj.interactionText = text;
    if (dialogue) obj.dialogueData = dialogue;

    this.physics.add.existing(obj, true);
    this.objects.push(obj);
  }

  update() {
    const speed = 150;
    const body = this.player.body;

    body.setVelocity(0);
    if (this.dialogueActive) return;

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
      if (near.dialogueData) {
        this.startDialogue(near.dialogueData);
      } else {
        this.addToDialogue(near.name, near.interactionText);
      }
      near.discovered = true;
    }

    if (
      Phaser.Input.Keyboard.JustDown(this.cursors.t) &&
      near &&
      near.discovered &&
      near.takeable
    ) {
      this.take(near);
    }
  }

  take(obj) {
    this.inventory.push({
      name: obj.name,
      text: obj.interactionText || "",
      description: obj.description || "",
      selected: false,
    });
    this.updateInventory();
    this.addToDialogue("Inventory", `${obj.name} added.`);
    this.objects = this.objects.filter((item) => item.name !== obj.name);
    obj.destroy();
  }

  toggleInventory(index) {
    if (index < 0 || index >= this.inventory.length) return;
    this.inventory[index].selected = !this.inventory[index].selected;
    this.updateInventory();
  }

  updateInventory() {
    if (!this.inventoryWindow) return;
    if (this.inventory.length === 0) {
      this.inventoryWindow.textContent = "No items";
      return;
    }
    this.inventoryWindow.innerHTML = this.inventory
      .map((item, index) => {
        const details =
          item.selected && item.description
            ? `<div class="inventory-item-details">${item.description}</div>`
            : "";
        const icon = item.description ? (item.selected ? "–" : "+") : "";
        return `<div class="inventory-item" data-index="${index}">
          <div class="inventory-item-header">
            <span>${item.name}</span>
            <span class="toggle-icon">${icon}</span>
          </div>
          ${details}
        </div>`;
      })
      .join("");
  }

  addToDialogue(speaker, text) {
    if (!this.dialogue) return;
    const fullText = text ? `${speaker}: ${text}` : speaker;
    this.dialogueHistory.push(fullText);
    this.renderDialogue();
  }

  startDialogue({ speaker, text, options = [] }) {
    this.dialogueActive = true;
    this.dialogueSpeaker = speaker;
    this.dialogueOptions = options.filter((option) => this.isDialogueOptionVisible(option));
    this.addToDialogue(speaker, text);
  }

  isDialogueOptionVisible(option) {
    if (!option.requiresItem) return true;
    return this.inventory.some((item) => item.name === option.requiresItem);
  }

  handleDialogueChoice(index) {
    if (!this.dialogueActive || !this.dialogueOptions[index]) return;
    const choice = this.dialogueOptions[index];
    this.addToDialogue("You", choice.text);
    if (choice.response) {
      this.addToDialogue(this.dialogueSpeaker, choice.response);
    }
    if (choice.isFinal === true) {
      this.endDialogue();
    }
  }

  endDialogue() {
    this.dialogueActive = false;
    this.dialogueOptions = [];
    this.renderDialogue();
  }

  renderDialogue() {
    if (!this.dialogue) return;

    const escapeHtml = (value) =>
      String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");

    const historyHtml = this.dialogueHistory
      .map((line) => `<div>${escapeHtml(line)}</div>`)
      .join("");

    const optionsHtml =
      this.dialogueActive && this.dialogueOptions.length
        ? `<div class="dialogue-options" style="margin-top:12px; display:flex; flex-direction:column; gap:8px;">${this.dialogueOptions
            .map(
              (option, optionIndex) =>
                `<button class="dialogue-option" data-index="${optionIndex}" style="padding:8px 10px; border:none; border-radius:6px; background:#333; color:#fff; cursor:pointer; text-align:left;">${escapeHtml(
                  option.text,
                )}</button>`,
            )
            .join("")}</div>`
        : "";

    this.dialogue.innerHTML = historyHtml + optionsHtml;
    this.dialogue.scrollTop = this.dialogue.scrollHeight;
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
