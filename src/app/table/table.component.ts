import { Component, OnInit } from '@angular/core';

import { BehaviorSubject, combineLatest } from 'rxjs';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.css']
})
export class TableComponent implements OnInit {
  // data
  heroes$ = new BehaviorSubject<{[name: string]: any}>({
    '1': {
      id: '1',
      name: 'Hammerer Maccabeus',
      types: 'Holy/Fire',
      attack: 286,
      defense: 255,
      speed: 230,
      healing: 103,
      recovery: 154,
      health: 766
    },
    '2': {
      id: '2',
      name: 'Ethereal Moodmorph',
      types: 'Water/Fire',
      attack: 206,
      defense: 203,
      speed: 254,
      healing: 102,
      recovery: 178,
      health: 1115
    },
    '3': {
      id: '3',
      name: 'Dwarf Bronnis',
      types: 'Earth/Fire',
      health: 869,
      attack: 255,
      defense: 255,
      healing: 128,
      recovery: 153,
      speed: 179
    },
    '4': {
      id: '4',
      name: 'Lady Sabrina',
      types: 'Water',
      health: 1336,
      attack: 317,
      defense: 205,
      healing: 122,
      recovery: 105,
      speed: 139
    },
    '5': {
      id: '5',
      name: 'Techno Fox',
      types: 'Electric',
      health: 712,
      attack: 301,
      defense: 133,
      healing: 159,
      recovery: 184,
      speed: 256
    },
    '6': {
      id: '6',
      name: 'Cleric Typh',
      types: 'Holy',
      health: 716,
      attack: 117,
      defense: 137,
      healing: 283,
      recovery: 272,
      speed: 229
    },
    '7': {
      id: '7',
      name: 'Technician Dustin',
      types: 'Electric/Arcane',
      health: 916,
      attack: 282,
      defense: 150,
      healing: 123,
      recovery: 144,
      speed: 286
    },
    '8': {
      id: '8',
      name: 'Dancer Galileo',
      types: 'Air/Holy',
      health: 517,
      attack: 116,
      defense: 180,
      healing: 229,
      recovery: 168,
      speed: 405
    }
  });

  // table
  orderedIds$ = new BehaviorSubject<string[]>([
    '8',
    '1',
    '2',
    '3',
    '4',
    '5',
    '6',
    '7',
  ]);
  heroIdToOrderIndex$ = new BehaviorSubject<{[heroId: string]: number}>({});
  superlatives$ = new BehaviorSubject<{[superlativeName: string]: string}>({});
  tableDataSource$ = new BehaviorSubject<any[]>([]);
  displayedColumns$ = new BehaviorSubject<string[]>([
    'name',
    'types',
    'attack',
    'defense',
    'speed',
    'healing',
    'recovery',
    'health',
    'levelUp'
  ]);
  draggingId$ = new BehaviorSubject<string>(null);

  constructor() { }

  ngOnInit() {
    // this.orderedIds$.subscribe(orderedIds => {
    //   const heroIdToOrderIndex: {[heroId: string]: number} = {};
    //   for (int i = 0; i < orderedIds.length; i++) {
    //     this.heroIdToOrderIndex[]
    //   }
    // })

    combineLatest(this.heroes$, this.orderedIds$)
    .subscribe(([heroes, orderedIds]) => {
      this.tableDataSource$.next(orderedIds.map(id => heroes[id]));
      const heroIdToOrderIndex: {[heroId: string]: number} = {};
      for (let i = 0; i < orderedIds.length; i++) {
        heroIdToOrderIndex[orderedIds[i]] = i;
      }
      this.heroIdToOrderIndex$.next(heroIdToOrderIndex);
    });

    this.heroes$.subscribe(changedHeroData => {
      const superlatives = {
        'highest-attack': null,
        'lowest-attack': null,
        'highest-defense': null,
        'lowest-defense': null,
        'highest-speed': null,
        'lowest-speed': null,
        'highest-healing': null,
        'lowest-healing': null,
        'highest-recovery': null,
        'lowest-recovery': null,
        'highest-health': null,
        'lowest-health': null
      };

      Object.values(changedHeroData).forEach(hero => {
        Object.keys(hero).forEach(key => {
          if (key === 'name' || key === 'types') { return; }

          const highest = `highest-${key}`;
          if (!superlatives[highest] || hero[key] > changedHeroData[superlatives[highest]][key]) {
            superlatives[highest] = hero.id;
          }

          const lowest = `lowest-${key}`;
          if (!superlatives[lowest] || hero[key] < changedHeroData[superlatives[lowest]][key]) {
            superlatives[lowest] = hero.id;
          }
        });
      });

      this.superlatives$.next(superlatives);
    });
  }

  levelUp(id: string) {
    const updatedHero = { ... this.heroes$.value[id] };
    updatedHero.attack = Math.round(updatedHero.attack * (1 + (Math.random() / 8)));
    updatedHero.defense = Math.round(updatedHero.defense * (1 + (Math.random() / 8)));
    updatedHero.speed = Math.round(updatedHero.speed * (1 + (Math.random() / 8)));
    updatedHero.recovery = Math.round(updatedHero.recovery * (1 + (Math.random() / 8)));
    updatedHero.healing = Math.round(updatedHero.healing * (1 + (Math.random() / 8)));
    updatedHero.health = Math.round(updatedHero.health * (1 + (Math.random() / 8)));

    const newHeroData = { ... this.heroes$.value };
    newHeroData[id] = updatedHero;

    this.heroes$.next(newHeroData);
  }

  heroDragStart(event: any, heroId: string) {
    this.draggingId$.next(heroId);
  }

  heroDragOver(event: any, heroDraggedOverId: string) {
    console.log(heroDraggedOverId);
    if (heroDraggedOverId === this.draggingId$.value) {
      return;
    }

    console.log('buzz');

    // swap ids
    const tempArray = this.orderedIds$.value;
    const draggingIdx = this.heroIdToOrderIndex$.value[this.draggingId$.value];
    const draggedOverIdx = this.heroIdToOrderIndex$.value[heroDraggedOverId];
    tempArray[draggedOverIdx] = this.draggingId$.value;
    tempArray[draggingIdx] = heroDraggedOverId;

    this.orderedIds$.next(tempArray);
  }

  heroDragDrop(event: any, heroId: any) {
    this.draggingId$.next(null);
  }

}
