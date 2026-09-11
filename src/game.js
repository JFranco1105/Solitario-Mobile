import Phaser from 'phaser';
import { showInterstitialAd } from './admob';

const SUITS = ['♥', '♦', '♣', '♠'];
const VALUES = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

export class SolitaireScene extends Phaser.Scene {
    constructor() {
        super({ key: 'SolitaireScene' });
        this.gamesPlayed = 0;
    }

    create() {
        const V_WIDTH = 720;
        const V_HEIGHT = 1280;

        // Desactivar menú contextual
        this.input.mouse.disableContextMenu();

        // Fondo verde clásico
        const bg = this.add.graphics();
        bg.fillStyle(0x0e5229, 1);
        bg.fillRect(0, 0, V_WIDTH, V_HEIGHT);

        // Dimensiones y posiciones fijas
        this.cardWidth = 88;
        this.cardHeight = 128;
        this.gapX = 12;
        this.startX = 20;
        this.topY = 40;
        this.tableauY = 200;
        this.cardOverlap = 32;

        // Variables de victoria, animación e historial
        this.isWinAnimating = false;
        this.bouncingCards = [];
        this.history = [];

        // Variables de cronómetro
        this.secondsElapsed = 0;
        this.timerStarted = false;
        this.timerEvent = null;

        this.createCardTextures();
        this.createBoardZones();
        this.setupDragEvents();
        this.createUI(V_WIDTH, V_HEIGHT);

        this.startNewGame();
    }

    update(time, delta) {
        if (this.isWinAnimating && this.bouncingCards.length > 0) {
            const dt = Math.min(delta / 1000, 0.05);
            const gravity = 1800;
            const floorY = 1280 - this.cardHeight;

            for (let i = this.bouncingCards.length - 1; i >= 0; i--) {
                const bc = this.bouncingCards[i];
                if (!bc.active) continue;

                bc.vy += gravity * dt;
                bc.sprite.x += bc.vx * dt;
                bc.sprite.y += bc.vy * dt;

                if (bc.sprite.x <= 0) {
                    bc.sprite.x = 0;
                    bc.vx = -bc.vx * 0.8;
                } else if (bc.sprite.x >= 720 - this.cardWidth) {
                    bc.sprite.x = 720 - this.cardWidth;
                    bc.vx = -bc.vx * 0.8;
                }

                if (bc.sprite.y >= floorY) {
                    bc.sprite.y = floorY;
                    bc.vy = -bc.vy * 0.72;
                    if (Math.abs(bc.vy) < 40) {
                        bc.vy = 0;
                    }
                }
            }
        }
    }

    // --- TEXTURAS ---
    createCardTextures() {
        if (this.textures.exists('card_back')) return;

        // Reverso
        const backGfx = this.make.graphics({ add: false });
        backGfx.fillStyle(0x1e3a8a);
        backGfx.fillRoundedRect(0, 0, this.cardWidth, this.cardHeight, 8);
        backGfx.lineStyle(3, 0x3b82f6);
        backGfx.strokeRoundedRect(3, 3, this.cardWidth - 6, this.cardHeight - 6, 6);
        backGfx.generateTexture('card_back', this.cardWidth, this.cardHeight);
        backGfx.destroy();

        // Slot vacío
        const slotGfx = this.make.graphics({ add: false });
        slotGfx.lineStyle(2, 0x15803d, 0.7);
        slotGfx.fillStyle(0x052e16, 0.4);
        slotGfx.fillRoundedRect(0, 0, this.cardWidth, this.cardHeight, 8);
        slotGfx.strokeRoundedRect(0, 0, this.cardWidth, this.cardHeight, 8);
        slotGfx.generateTexture('card_slot', this.cardWidth, this.cardHeight);
        slotGfx.destroy();

        // Las 52 cartas
        SUITS.forEach(suit => {
            const isRed = suit === '♥' || suit === '♦';
            const colorStr = isRed ? '#dc2626' : '#111827';

            VALUES.forEach((valStr, valIdx) => {
                const key = `card_${suit}_${valStr}`;
                if (this.textures.exists(key)) return;

                const canvasTexture = this.textures.createCanvas(key, this.cardWidth, this.cardHeight);
                const ctx = canvasTexture.context;

                ctx.fillStyle = '#ffffff';
                if (typeof ctx.roundRect === 'function') {
                    ctx.beginPath();
                    ctx.roundRect(0, 0, this.cardWidth, this.cardHeight, 8);
                    ctx.fill();
                    ctx.lineWidth = 2;
                    ctx.strokeStyle = '#d1d5db';
                    ctx.stroke();
                } else {
                    ctx.fillRect(0, 0, this.cardWidth, this.cardHeight);
                }

                ctx.fillStyle = colorStr;
                ctx.font = 'bold 18px sans-serif';
                ctx.textAlign = 'left';
                ctx.textBaseline = 'top';
                ctx.fillText(valStr, 8, 6);
                ctx.fillText(suit, 8, 26);

                ctx.font = '36px sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(suit, this.cardWidth / 2, this.cardHeight / 2 + 6);

                canvasTexture.refresh();
            });
        });
    }

    createBoardZones() {
        this.foundations = [];
        this.tableaus = [];

        this.stockSlot = this.add.image(this.startX, this.topY, 'card_slot').setOrigin(0);
        this.wasteSlot = this.add.image(this.startX + this.cardWidth + this.gapX, this.topY, 'card_slot').setOrigin(0);

        this.stockZone = this.add.zone(this.startX, this.topY, this.cardWidth, this.cardHeight)
            .setOrigin(0)
            .setInteractive({ useHandCursor: true })
            .setDepth(2000);

        this.stockZone.on('pointerdown', (pointer) => {
            if (pointer.button !== 0 && pointer.button !== undefined) return;
            this.drawFromStock();
        });

        for (let i = 0; i < 4; i++) {
            const x = this.startX + (this.cardWidth + this.gapX) * (3 + i);
            const slot = this.add.image(x, this.topY, 'card_slot').setOrigin(0);
            this.foundations.push({ x, y: this.topY, cards: [], slot });
        }

        for (let i = 0; i < 7; i++) {
            const x = this.startX + (this.cardWidth + this.gapX) * i;
            const slot = this.add.image(x, this.tableauY, 'card_slot').setOrigin(0);
            this.tableaus.push({ x, y: this.tableauY, cards: [], slot });
        }
    }

    // --- HISTORIAL E HISTORIAL DE MOVIMIENTOS (UNDO) ---
    recordState() {
        const snapshot = {
            stock: [...this.stock.map(c => c.id)],
            waste: [...this.waste.map(c => c.id)],
            foundations: this.foundations.map(f => [...f.cards.map(c => c.id)]),
            tableaus: this.tableaus.map(t => t.cards.map(c => ({ id: c.id, isFaceUp: c.isFaceUp })))
        };
        this.history.push(snapshot);
        if (this.history.length > 50) this.history.shift();
    }

    undoMove() {
        if (this.isWinAnimating || this.history.length === 0) return;
        const snapshot = this.history.pop();
        this.restoreState(snapshot);
    }

    restoreState(snapshot) {
        const cardMap = new Map();
        this.deck.forEach(c => cardMap.set(c.id, c));

        this.stock = snapshot.stock.map(id => cardMap.get(id));
        this.waste = snapshot.waste.map(id => cardMap.get(id));

        for (let i = 0; i < 4; i++) {
            this.foundations[i].cards = snapshot.foundations[i].map(id => cardMap.get(id));
        }

        for (let i = 0; i < 7; i++) {
            this.tableaus[i].cards = snapshot.tableaus[i].map(item => {
                const card = cardMap.get(item.id);
                card.isFaceUp = item.isFaceUp;
                return card;
            });
        }

        this.updateStockState();
        this.updateWasteInteractivity();

        for (let i = 0; i < 7; i++) {
            const tab = this.tableaus[i];
            tab.cards.forEach((c) => {
                c.location = 'tableau';
                c.tableauIndex = i;
                this.flipCard(c, c.isFaceUp);
            });
            this.updateTableauPositions(i);
        }

        for (let i = 0; i < 4; i++) {
            const f = this.foundations[i];
            f.cards.forEach((c, idx) => {
                c.location = 'foundation';
                c.tableauIndex = -1;
                c.isFaceUp = true;
                c.sprite.setTexture(c.textureKey);
                c.sprite.setPosition(f.x, f.y);
                c.sprite.setDepth(200 + i * 20 + idx);
                c.sprite.disableInteractive();
            });
        }
    }

    // --- CRONÓMETRO ---
    resetTimer() {
        if (this.timerEvent) {
            this.timerEvent.destroy();
            this.timerEvent = null;
        }
        this.timerStarted = false;
        this.secondsElapsed = 0;
        this.updateTimerText();
    }

    startTimer() {
        if (this.timerStarted) return;
        this.timerStarted = true;
        this.timerEvent = this.time.addEvent({
            delay: 1000,
            callback: () => {
                this.secondsElapsed++;
                this.updateTimerText();
            },
            loop: true
        });
    }

    stopTimer() {
        if (this.timerEvent) {
            this.timerEvent.destroy();
            this.timerEvent = null;
        }
        this.timerStarted = false;
    }

    updateTimerText() {
        const mins = Math.floor(this.secondsElapsed / 60).toString().padStart(2, '0');
        const secs = (this.secondsElapsed % 60).toString().padStart(2, '0');
        if (this.timerText) {
            this.timerText.setText(`⏱ ${mins}:${secs}`);
        }
    }

    startNewGame() {
        this.isWinAnimating = false;
        this.bouncingCards = [];
        this.history = [];
        this.resetTimer();
        this.hideVictoryModal();

        if (this.deck) {
            this.deck.forEach(c => c.sprite.destroy());
        }

        this.deck = [];
        this.waste = [];
        this.foundations.forEach(f => f.cards = []);
        this.tableaus.forEach(t => t.cards = []);

        let id = 0;
        SUITS.forEach(suit => {
            VALUES.forEach((valStr, valIdx) => {
                const isRed = suit === '♥' || suit === '♦';
                const textureKey = `card_${suit}_${valStr}`;
                const sprite = this.add.image(0, 0, 'card_back').setOrigin(0);

                const card = {
                    id: id++,
                    suit,
                    value: valIdx + 1,
                    color: isRed ? 'red' : 'black',
                    isFaceUp: false,
                    textureKey,
                    sprite,
                    location: 'stock',
                    tableauIndex: -1
                };

                sprite.setData('card', card);
                this.deck.push(card);
            });
        });

        Phaser.Utils.Array.Shuffle(this.deck);

        let deckIdx = 0;
        for (let col = 0; col < 7; col++) {
            for (let row = 0; row <= col; row++) {
                const card = this.deck[deckIdx++];
                const tab = this.tableaus[col];
                tab.cards.push(card);
                card.location = 'tableau';
                card.tableauIndex = col;

                this.flipCard(card, row === col);
            }
            this.updateTableauPositions(col);
        }

        this.stock = this.deck.slice(deckIdx);
        this.updateStockState();
        this.updateWasteInteractivity();
    }

    flipCard(card, faceUp) {
        card.isFaceUp = faceUp;
        if (faceUp) {
            card.sprite.setTexture(card.textureKey);
            card.sprite.setInteractive({ useHandCursor: true, draggable: true });
        } else {
            card.sprite.setTexture('card_back');
            card.sprite.disableInteractive();
        }
    }

    updateStockState() {
        this.stock.forEach((card, index) => {
            card.isFaceUp = false;
            card.location = 'stock';
            card.tableauIndex = -1;
            card.sprite.setTexture('card_back');
            card.sprite.disableInteractive();
            card.sprite.setPosition(this.startX, this.topY);
            card.sprite.setDepth(1 + index);
        });

        if (this.stock.length > 0) {
            this.stockSlot.setAlpha(1);
        } else {
            this.stockSlot.setAlpha(0.3);
        }
    }

    updateWasteInteractivity() {
        const wasteX = this.startX + this.cardWidth + this.gapX;
        this.waste.forEach((card, index) => {
            const isTop = (index === this.waste.length - 1);
            card.location = 'waste';
            card.tableauIndex = -1;
            card.sprite.setPosition(wasteX, this.topY);
            card.sprite.setDepth(10 + index);

            if (isTop) {
                this.flipCard(card, true);
            } else {
                card.isFaceUp = true;
                card.sprite.setTexture(card.textureKey);
                card.sprite.disableInteractive();
            }
        });

        if (this.waste.length === 0) {
            this.wasteSlot.setAlpha(0.3);
        } else {
            this.wasteSlot.setAlpha(1);
        }
    }

    updateTableauPositions(tabIndex) {
        const tab = this.tableaus[tabIndex];
        tab.cards.forEach((c, row) => {
            c.location = 'tableau';
            c.tableauIndex = tabIndex;
            c.sprite.setPosition(tab.x, tab.y + (row * this.cardOverlap));
            c.sprite.setDepth(100 + tabIndex * 50 + row);
        });
    }

    drawFromStock() {
        if (this.isWinAnimating) return;
        this.startTimer();
        this.recordState();

        if (this.stock.length > 0) {
            const card = this.stock.pop();
            this.waste.push(card);
            this.updateStockState();
            this.updateWasteInteractivity();
        } else if (this.waste.length > 0) {
            this.stock = [...this.waste].reverse();
            this.waste = [];
            this.updateStockState();
            this.updateWasteInteractivity();
        }
    }

    // --- ARRASTRE Y EVENTOS ---
    setupDragEvents() {
        this.draggedCards = [];
        this.dragStartPos = [];

        this.input.on('gameobjectdown', (pointer, gameObject) => {
            if (pointer.button !== 0 && pointer.button !== undefined) return;
            if (this.isWinAnimating) return;

            const card = gameObject.getData('card');
            if (!card || !card.isFaceUp) return;

            if (card.location === 'waste' && this.waste[this.waste.length - 1] !== card) return;

            const now = this.time.now;
            if (gameObject.lastClickTime && (now - gameObject.lastClickTime) < 300) {
                this.startTimer();
                this.recordState();
                this.tryAutoMoveToFoundation(card);
            }
            gameObject.lastClickTime = now;
        });

        this.input.on('dragstart', (pointer, gameObject) => {
            if (pointer.button !== 0 && pointer.button !== undefined) return;
            if (this.isWinAnimating) return;

            const card = gameObject.getData('card');
            if (!card || !card.isFaceUp) return;

            this.startTimer();
            this.draggedCards = [];
            this.dragStartPos = [];

            if (card.location === 'tableau') {
                const tab = this.tableaus[card.tableauIndex];
                const cardIndex = tab.cards.indexOf(card);
                if (cardIndex !== -1) {
                    this.draggedCards = tab.cards.slice(cardIndex);
                }
            } else if (card.location === 'waste') {
                if (this.waste.length > 0 && this.waste[this.waste.length - 1] === card) {
                    this.draggedCards = [card];
                }
            } else if (card.location === 'foundation') {
                this.draggedCards = [card];
            }

            if (this.draggedCards.length === 0) return;

            this.recordState();

            this.draggedCards.forEach((c, idx) => {
                this.dragStartPos.push({ x: c.sprite.x, y: c.sprite.y });
                c.sprite.setDepth(10000 + idx);
            });
        });

        this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
            if (this.draggedCards.length === 0) return;

            const mainCard = this.draggedCards[0];
            const deltaX = dragX - mainCard.sprite.x;
            const deltaY = dragY - mainCard.sprite.y;

            this.draggedCards.forEach(c => {
                c.sprite.x += deltaX;
                c.sprite.y += deltaY;
            });
        });

        this.input.on('dragend', () => {
            if (this.draggedCards.length === 0) return;

            const mainCard = this.draggedCards[0];
            let dropped = false;

            if (this.draggedCards.length === 1) {
                const foundationIdx = this.findBestFoundation(mainCard);
                if (foundationIdx !== -1) {
                    this.moveCardsToFoundation(mainCard, foundationIdx);
                    dropped = true;
                }
            }

            if (!dropped) {
                const tableauIdx = this.findBestTableau(mainCard);
                if (tableauIdx !== -1) {
                    this.moveCardsToTableau(this.draggedCards, tableauIdx);
                    dropped = true;
                }
            }

            if (!dropped) {
                // Si no se colocó, quitamos el estado guardado en vano
                this.history.pop();

                this.draggedCards.forEach((c, idx) => {
                    const pos = this.dragStartPos[idx];
                    c.sprite.setPosition(pos.x, pos.y);

                    if (c.location === 'tableau') {
                        this.updateTableauPositions(c.tableauIndex);
                    } else if (c.location === 'waste') {
                        this.updateWasteInteractivity();
                    } else if (c.location === 'foundation') {
                        const fIdx = this.foundations.findIndex(f => f.cards.includes(c));
                        if (fIdx !== -1) {
                            c.sprite.setDepth(200 + fIdx * 20 + this.foundations[fIdx].cards.indexOf(c));
                        }
                    }
                });
            }

            this.draggedCards = [];
            this.checkWinCondition();
        });
    }

    findBestFoundation(mainCard) {
        let bestIdx = -1;
        let maxArea = 0;
        let minDistance = 120;

        const cardCenterX = mainCard.sprite.x + this.cardWidth / 2;
        const cardCenterY = mainCard.sprite.y + this.cardHeight / 2;
        const cardRect = new Phaser.Geom.Rectangle(mainCard.sprite.x, mainCard.sprite.y, this.cardWidth, this.cardHeight);

        for (let i = 0; i < 4; i++) {
            const f = this.foundations[i];
            if (!this.canPlaceOnFoundation(mainCard, f)) continue;

            const targetRect = new Phaser.Geom.Rectangle(f.x, f.y, this.cardWidth, this.cardHeight);
            const intersection = Phaser.Geom.Intersects.GetRectangleIntersection(cardRect, targetRect);

            if (intersection.width > 0 && intersection.height > 0) {
                const area = intersection.width * intersection.height;
                if (area > maxArea) {
                    maxArea = area;
                    bestIdx = i;
                }
            } else if (maxArea === 0) {
                const targetCenterX = f.x + this.cardWidth / 2;
                const targetCenterY = f.y + this.cardHeight / 2;
                const dist = Phaser.Math.Distance.Between(cardCenterX, cardCenterY, targetCenterX, targetCenterY);

                if (dist < minDistance) {
                    minDistance = dist;
                    bestIdx = i;
                }
            }
        }
        return bestIdx;
    }

    findBestTableau(mainCard) {
        let bestIdx = -1;
        let maxArea = 0;
        let minDistance = 100;

        const cardRect = new Phaser.Geom.Rectangle(mainCard.sprite.x, mainCard.sprite.y, this.cardWidth, this.cardHeight);
        const cardCenterX = mainCard.sprite.x + this.cardWidth / 2;
        const cardCenterY = mainCard.sprite.y + this.cardHeight / 2;

        for (let i = 0; i < 7; i++) {
            const t = this.tableaus[i];
            if (!this.canPlaceOnTableau(mainCard, t)) continue;

            const targetY = t.cards.length > 0 ? t.y + ((t.cards.length - 1) * this.cardOverlap) : t.y;
            const targetRect = new Phaser.Geom.Rectangle(t.x, targetY, this.cardWidth, this.cardHeight);
            const intersection = Phaser.Geom.Intersects.GetRectangleIntersection(cardRect, targetRect);

            if (intersection.width > 0 && intersection.height > 0) {
                const area = intersection.width * intersection.height;
                if (area > maxArea) {
                    maxArea = area;
                    bestIdx = i;
                }
            } else if (maxArea === 0) {
                const targetCenterX = t.x + this.cardWidth / 2;
                const targetCenterY = targetY + this.cardHeight / 2;
                const dist = Phaser.Math.Distance.Between(cardCenterX, cardCenterY, targetCenterX, targetCenterY);

                if (dist < minDistance) {
                    minDistance = dist;
                    bestIdx = i;
                }
            }
        }
        return bestIdx;
    }

    canPlaceOnFoundation(card, foundation) {
        const topCard = foundation.cards[foundation.cards.length - 1];
        if (!topCard) return card.value === 1;
        return card.suit === topCard.suit && card.value === topCard.value + 1;
    }

    canPlaceOnTableau(card, tableau) {
        const topCard = tableau.cards[tableau.cards.length - 1];
        if (!topCard) return card.value === 13;
        return topCard.isFaceUp && card.color !== topCard.color && card.value === topCard.value - 1;
    }

    removeCardFromSource(cards) {
        const sourceCard = cards[0];
        if (sourceCard.location === 'tableau') {
            const sourceTabIdx = sourceCard.tableauIndex;
            const sourceTab = this.tableaus[sourceTabIdx];
            sourceTab.cards = sourceTab.cards.filter(c => !cards.includes(c));

            if (sourceTab.cards.length > 0) {
                const lastCard = sourceTab.cards[sourceTab.cards.length - 1];
                if (!lastCard.isFaceUp) {
                    this.flipCard(lastCard, true);
                }
            }
            this.updateTableauPositions(sourceTabIdx);
        } else if (sourceCard.location === 'waste') {
            this.waste = this.waste.filter(c => c !== sourceCard);
            this.updateWasteInteractivity();
        } else if (sourceCard.location === 'foundation') {
            const f = this.foundations.find(f => f.cards.includes(sourceCard));
            if (f) {
                f.cards = f.cards.filter(c => c !== sourceCard);
            }
        }
    }

    moveCardsToTableau(cards, targetTableauIdx) {
        this.removeCardFromSource(cards);
        const targetTab = this.tableaus[targetTableauIdx];
        cards.forEach(c => targetTab.cards.push(c));
        this.updateTableauPositions(targetTableauIdx);
    }

    moveCardsToFoundation(card, targetFoundationIdx) {
        this.removeCardFromSource([card]);
        const f = this.foundations[targetFoundationIdx];
        card.location = 'foundation';
        card.tableauIndex = -1;
        f.cards.push(card);
        card.sprite.setPosition(f.x, f.y);
        card.sprite.setDepth(200 + targetFoundationIdx * 20 + f.cards.length);
    }

    tryAutoMoveToFoundation(card) {
        if (card.location === 'tableau') {
            const tab = this.tableaus[card.tableauIndex];
            if (tab.cards[tab.cards.length - 1] !== card) return;
        } else if (card.location === 'waste') {
            if (this.waste[this.waste.length - 1] !== card) return;
        }

        for (let i = 0; i < 4; i++) {
            const f = this.foundations[i];
            if (this.canPlaceOnFoundation(card, f)) {
                this.moveCardsToFoundation(card, i);
                this.checkWinCondition();
                break;
            }
        }
    }

    checkWinCondition() {
        const totalInFoundations = this.foundations.reduce((acc, f) => acc + f.cards.length, 0);
        if (totalInFoundations === 52 && !this.isWinAnimating) {
            this.triggerWinSequence();
        }
    }

    triggerWinSequence() {
        this.stopTimer();
        this.isWinAnimating = true;
        this.bouncingCards = [];

        const allCards = [];
        this.foundations.forEach(f => {
            f.cards.forEach(c => allCards.push(c));
        });

        let index = 0;
        allCards.forEach(card => {
            this.time.delayedCall(index * 110, () => {
                card.sprite.setDepth(15000 + index);
                card.sprite.disableInteractive();
                this.bouncingCards.push({
                    sprite: card.sprite,
                    vx: Phaser.Math.Between(-350, 350),
                    vy: Phaser.Math.Between(-650, -300),
                    active: true
                });
            });
            index++;
        });

        this.time.delayedCall(7500, () => {
            this.showVictoryModal();
        });
    }

    showVictoryModal() {
        if (this.modalContainer) return;

        const width = 720;
        const height = 1280;

        this.modalContainer = this.add.container(0, 0).setDepth(30000);

        const bgOverlay = this.add.graphics();
        bgOverlay.fillStyle(0x000000, 0.75);
        bgOverlay.fillRect(0, 0, width, height);
        this.modalContainer.add(bgOverlay);

        const modalW = 540;
        const modalH = 420;
        const modalX = (width - modalW) / 2;
        const modalY = (height - modalH) / 2;

        const modalBg = this.add.graphics();
        modalBg.fillStyle(0x064e3b, 1);
        modalBg.fillRoundedRect(modalX, modalY, modalW, modalH, 20);
        modalBg.lineStyle(4, 0xf59e0b, 1);
        modalBg.strokeRoundedRect(modalX, modalY, modalW, modalH, 20);
        this.modalContainer.add(modalBg);

        const title = this.add.text(width / 2, modalY + 60, '🏆 ¡VICTORIA!', {
            fontSize: '42px',
            color: '#fbbf24',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        this.modalContainer.add(title);

        const mins = Math.floor(this.secondsElapsed / 60).toString().padStart(2, '0');
        const secs = (this.secondsElapsed % 60).toString().padStart(2, '0');
        const timeText = this.add.text(width / 2, modalY + 150, `⏱ Tiempo: ${mins}:${secs}`, {
            fontSize: '28px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        this.modalContainer.add(timeText);

        const gamesText = this.add.text(width / 2, modalY + 210, `🎮 Partidas completadas: ${this.gamesPlayed + 1}`, {
            fontSize: '24px',
            color: '#d1fae5'
        }).setOrigin(0.5);
        this.modalContainer.add(gamesText);

        const btnW = 260;
        const btnH = 60;
        const btnX = width / 2;
        const btnY = modalY + 310;

        const btnGfx = this.add.graphics();
        btnGfx.fillStyle(0x2563eb, 1);
        btnGfx.fillRoundedRect(btnX - btnW / 2, btnY - btnH / 2, btnW, btnH, 16);
        this.modalContainer.add(btnGfx);

        const btnText = this.add.text(btnX, btnY, 'Jugar de nuevo', {
            fontSize: '24px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        this.modalContainer.add(btnText);

        const btnZone = this.add.zone(btnX, btnY, btnW, btnH)
            .setInteractive({ useHandCursor: true });
        this.modalContainer.add(btnZone);

        btnZone.on('pointerdown', (pointer) => {
            if (pointer.button !== 0 && pointer.button !== undefined) return;
            this.onGameFinished();
        });
    }

    hideVictoryModal() {
        if (this.modalContainer) {
            this.modalContainer.destroy();
            this.modalContainer = null;
        }
    }

    createUI(width, height) {
        const bar = this.add.graphics();
        bar.fillStyle(0x052e16, 0.95);
        bar.fillRect(0, height - 90, width, 90);

        // Texto de partidas
        this.statusText = this.add.text(20, height - 50, `Partidas: ${this.gamesPlayed}`, {
            fontSize: '24px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0, 0.5);

        // Botón Deshacer (Undo)
        const undoX = 220;
        const undoY = height - 50;
        const undoGfx = this.add.graphics();
        undoGfx.fillStyle(0xd97706, 1);
        undoGfx.fillRoundedRect(undoX - 20, undoY - 20, 40, 40, 10);
        this.add.text(undoX, undoY, '↩', { fontSize: '20px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5);
        const undoZone = this.add.zone(undoX, undoY, 90, 40).setInteractive({ useHandCursor: true });
        undoZone.on('pointerdown', (p) => { if (p.button === 0 || p.button === undefined) this.undoMove(); });

        // Cronómetro
        this.timerText = this.add.text(350, height - 50, '⏱ 00:00', {
            fontSize: '24px',
            color: '#fbbf24',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Botón Reiniciar
        const btnX = 600;
        const btnY = height - 50;
        const btnGfx = this.add.graphics();
        btnGfx.fillStyle(0x2563eb, 1);
        btnGfx.fillRoundedRect(btnX - 75, btnY - 20, 150, 40, 10);
        this.add.text(btnX, btnY, 'Reiniciar', { fontSize: '24px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5);

        const btnZone = this.add.zone(btnX, btnY, 110, 40).setInteractive({ useHandCursor: true });
        btnZone.on('pointerdown', (pointer) => {
            if (pointer.button !== 0 && pointer.button !== undefined) return;
            this.onGameFinished();
        });
    }

    async onGameFinished() {
        this.gamesPlayed++;
        this.statusText.setText(`Partidas: ${this.gamesPlayed}`);

        if (this.gamesPlayed % 2 === 0) {
            await showInterstitialAd();
        }

        this.startNewGame();
    }
}

export function createGameConfig() {
    return {
        type: Phaser.AUTO,
        parent: 'app',
        width: 720,
        height: 1280,
        scale: {
            mode: Phaser.Scale.FIT,
            autoCenter: Phaser.Scale.CENTER_BOTH
        },
        scene: [SolitaireScene]
    };
}