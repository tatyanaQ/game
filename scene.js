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
      response:
        "I'd like that. We can have some deep conversations about existence.",
    },
    {
      text: "Where can I find an egg?",
      response: "Look in the kitchen. I think there's one in the fridge.",
      requiresItems: ["Antihangover recipe"],
      unlocksItems: ["Egg", "Hot sauce"],
      conflictingItems: ["Egg"],
    },
    {
      text: "Cheers!",
      response: "Now you look like an person. Or at least closer to one.",
      requiresItems: ["Classic hangover cure"],
      losesItems: ["Classic hangover cure"],
    },
    {
      text: "Cheers!",
      response: "Wow, I didn't think you could look even worse.",
      requiresItems: ["Pickle juice hangover cure"],
      losesItems: ["Pickle juice hangover cure"],
    },
    {
      text: "Cheers!",
      response: "Well, at least you're not dead.",
      requiresItems: ["Hot sauce hangover cure"],
      losesItems: ["Hot sauce hangover cure"],
    },
    {
      text: "See you later.",
      response: "Take care! I'll be here whenever you want to chat.",
      isFinal: true,
    },
  ],
};

const potDialogue = {
  speaker: "Pot",
  options: [
    {
      text: "Add egg",
      requiresItems: ["Egg"],
      losesItems: ["Egg"],
    },
    {
      text: "Add slice of ham",
      requiresItems: ["Slice of ham"],
      losesItems: ["Slice of ham"],
    },
    {
      text: "Add 2 slices of bread",
      requiresItems: ["Slices of bread"],
      losesItems: ["Slices of bread"],
    },
    {
      text: "Add hot sauce",
      requiresItems: ["Hot sauce"],
      losesItems: ["Hot sauce"],
    },
    {
      text: "Add pickle juice",
      requiresItems: ["Pickle juice"],
      losesItems: ["Pickle juice"],
    },
    {
      text: "Cook",
      response: "This has bubbles... Drink at your own risk!",
      requiresLostItems: ["Hot sauce"],
      givesItems: ["Spicy hangover cure"],
      conflictingItems: [
        "Spicy hangover cure",
        "Classic hangover cure",
        "Pickle juice hangover cure",
      ],
      isFinal: true,
    },
    {
      text: "Cook",
      response: "This has bubbles... Not sure if it's ready, but bottoms up!",
      requiresLostItems: ["Pickle juice"],
      givesItems: ["Pickle juice hangover cure"],
      conflictingItems: [
        "Spicy hangover cure",
        "Classic hangover cure",
        "Pickle juice hangover cure",
      ],
      isFinal: true,
    },
    {
      text: "Cook",
      response: "This has bubbles... Bon appétit!",
      requiresLostItems: ["Egg", "Slice of ham", "Slices of bread"],
      conflictingLostItems: ["Hot sauce", "Pickle juice"],
      givesItems: ["Classic hangover cure"],
      conflictingItems: [
        "Spicy hangover cure",
        "Classic hangover cure",
        "Pickle juice hangover cure",
      ],
      isFinal: true,
    },
    {
      text: "See you later.",
      isFinal: true,
    },
  ],
};

const random = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

class RoomScene extends Phaser.Scene {
  constructor() {
    super("room");
  }

  create() {
    // player
    this.player = this.add.rectangle(100, 100, 30, 30, 0x00ffff);
    this.physics.add.existing(this.player);
    this.player.body.setCollideWorldBounds(true);

    // objects
    this.objects = [];

    this.createObject({
      x: random(100, 700),
      y: random(100, 500),
      name: "Antihangover recipe",
      description: ["1 egg", "2 slices of bread", "1 slice of ham"]
        .map((item) => `- ${item}`)
        .join("\n"),
      takeable: true,
      active: true,
      unlocksItems: ["Pickle juice", "Pot"],
    });
    this.createObject({
      x: random(100, 700),
      y: random(100, 500),
      name: "Mirror",
      text: "**Looks back at you**",
      dialogue: mirrorDialogue,
      active: true,
    });
    this.createObject({
      x: random(100, 700),
      y: random(100, 500),
      name: "Egg",
      takeable: true,
    });
    this.createObject({
      x: random(100, 700),
      y: random(100, 500),
      name: "Slice of ham",
      takeable: true,
    });
    this.createObject({
      x: random(100, 700),
      y: random(100, 500),
      name: "Slices of bread",
      takeable: true,
    });
    this.createObject({
      x: random(100, 700),
      y: random(100, 500),
      name: "Hot sauce",
      takeable: true,
      unlocksItems: ["Slice of ham"],
    });
    this.createObject({
      x: random(100, 700),
      y: random(100, 500),
      name: "Pickle juice",
      takeable: true,
    });
    this.createObject({
      x: random(100, 700),
      y: random(100, 500),
      name: "Sparkling water",
      unlocksItems: ["Slices of bread"],
      takeable: true,
      active: true,
    });
    this.createObject({
      x: random(100, 700),
      y: random(100, 500),
      name: "Pot",
      dialogue: potDialogue,
    });

    // dialogue and inventory panels
    this.dialogue = document.getElementById("dialogue-window");
    this.inventoryWindow = document.getElementById("inventory-items");
    this.inventory = [];
    this.lostItems = [];
    this.dialogueHistory = [];
    this.dialogueActive = false;
    this.allDialogueOptions = [];
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
    active = false,
    takeable = false,
    dialogue = null,
    unlocksItems = [],
  }) {
    const obj = this.add.rectangle(x, y, 40, 40, 0xff8800);
    obj.name = name;
    obj.takeable = takeable;
    obj.description = description;
    obj.active = active;

    if (text) obj.interactionText = text;
    if (dialogue) obj.dialogueData = dialogue;
    if (unlocksItems.length) obj.unlocksItems = unlocksItems;

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
        if (obj.active) {
          obj.fillColor = 0xfff01f;
        }
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

      if (dist < 70 && obj.active) {
        obj.fillColor = 0x00ff00;
        near = obj;
      } else if (this.cursors.h.isUp) {
        obj.fillColor = 0xff8800;
      }
    }

    if (Phaser.Input.Keyboard.JustDown(this.cursors.e) && near && near.active) {
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
      near.takeable &&
      near.active
    ) {
      this.take(near);
    }
  }

  unlockItems(itemNames) {
    const items = this.objects.filter((o) => itemNames.includes(o.name));
    items.forEach((item) => {
      item.active = true;
    });
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
    if (obj.active) obj.active = false;
    if (obj.destroy) obj.destroy();

    if (obj.unlocksItems?.length) {
      this.unlockItems(obj.unlocksItems);
    }
  }

  lose(obj) {
    const index = this.inventory.findIndex((i) => i.name === obj.name);
    if (index === -1) return;
    this.inventory.splice(index, 1);
    this.updateInventory();
    this.addToDialogue("Inventory", `${obj.name} removed.`);
    this.lostItems.push(obj);
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
    this.allDialogueOptions = options;
    this.dialogueOptions = this.allDialogueOptions.filter((option) =>
      this.isDialogueOptionVisible(option),
    );
    this.addToDialogue(speaker, text);
  }

  refreshDialogueOptions() {
    this.dialogueOptions = this.allDialogueOptions.filter((option) =>
      this.isDialogueOptionVisible(option),
    );
  }

  isDialogueOptionVisible(option) {
    if (option.requiresItems?.length) {
      const hasRequiredItems = option.requiresItems.every((itemName) =>
        this.inventory.some((item) => item.name === itemName),
      );
      if (!hasRequiredItems) return false;
    }

    if (option.conflictingItems?.length) {
      const hasConflictingItems = option.conflictingItems.some((itemName) =>
        this.inventory.some((item) => item.name === itemName),
      );
      if (hasConflictingItems) return false;
    }

    if (option.requiresLostItems?.length) {
      const hasRequiredLostItems = option.requiresLostItems.every((itemName) =>
        this.lostItems.some((item) => item.name === itemName),
      );
      if (!hasRequiredLostItems) return false;
    }

    if (option.conflictingLostItems?.length) {
      const hasConflictingLostItems = option.conflictingLostItems.some(
        (itemName) => this.lostItems.some((item) => item.name === itemName),
      );
      if (hasConflictingLostItems) return false;
    }

    return true;
  }

  handleDialogueChoice(index) {
    if (!this.dialogueActive || !this.dialogueOptions[index]) return;
    const choice = this.dialogueOptions[index];
    this.addToDialogue("You", choice.text);
    if (choice.losesItems?.length) {
      choice.losesItems.forEach((itemName) => {
        const item = this.inventory.find((i) => i.name === itemName);
        if (item) {
          this.lose(item);
        }
      });
    }
    if (choice.response) {
      this.addToDialogue(this.dialogueSpeaker, choice.response);
    }
    if (choice.unlocksItems?.length) {
      this.unlockItems(choice.unlocksItems);
    }
    if (choice.givesItems?.length) {
      choice.givesItems.forEach((item) => {
        this.take({ name: item });
      });
    }
    if (choice.isFinal === true) {
      this.endDialogue();
    } else {
      this.refreshDialogueOptions();
      this.renderDialogue();
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
