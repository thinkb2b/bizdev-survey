import { SurveyBlock } from './types';

export const SURVEY_BLOCKS: SurveyBlock[] = [
  {
    id: 'block1',
    title: 'Block 1: Rolle, Kompetenz, Motivation',
    questions: [
      {
        id: 'b1_role',
        type: 'textarea',
        text: 'Was ist Deine Rolle im Unternehmen?',
        helperText: '(offizielle Funktion / organisatorische Einordnung)'
      },
      {
        id: 'b1_time_allocation',
        type: 'textarea',
        text: 'Wie ist Deine Rolle im Hinblick auf die Entwicklung neuer Produkte oder neuer Geschäftsideen – und wie viel Zeit kannst Du realistisch dafür einbringen?',
        helperText: '(z. B. Kernaufgabe, Nebenrolle, punktuell; grobe %-Angabe)'
      },
      {
        id: 'b1_strengths',
        type: 'textarea',
        text: 'Wo siehst Du Deine größten fachlichen Stärken, die für Business Development relevant sind?',
        helperText: '(z. B. Technik, Markt, Kunden, Prozesse, Netzwerk)'
      },
      {
        id: 'b1_impact',
        type: 'textarea',
        text: 'In welchen Situationen oder Projekten warst Du bisher besonders wirksam oder konntest spürbaren Impact erzielen?'
      },
      {
        id: 'b1_motivation',
        type: 'textarea',
        text: 'Was motiviert Dich persönlich an der Mitarbeit an neuen Produkten oder Geschäftsideen?'
      },
      {
        id: 'b1_energy_drain',
        type: 'textarea',
        text: 'Was kostet Dich im aktuellen Arbeitsalltag am meisten Energie oder bremst Dich?'
      }
    ]
  },
  {
    id: 'block2',
    title: 'Block 2: Bisherige Arbeitsweise',
    questions: [
      {
        id: 'b2_recent_work',
        type: 'textarea',
        text: 'Woran hast Du in den letzten 12–18 Monaten konkret im Kontext neuer Produkte, Technologien oder Geschäftsideen gearbeitet?'
      },
      {
        id: 'b2_process',
        type: 'textarea',
        text: 'Wie seid ihr dabei typischerweise vorgegangen?',
        helperText: '(Tools, Prozesse, Entscheidungswege, Abstimmungen)'
      },
      {
        id: 'b2_decisions',
        type: 'textarea',
        text: 'Wo wurden Entscheidungen klar getroffen – und wo eher vermieden oder verzögert?'
      },
      {
        id: 'b2_surprise',
        type: 'textarea',
        text: 'Was hat Dich in der bisherigen Zusammenarbeit besonders überrascht (positiv oder negativ)?'
      }
    ]
  },
  {
    id: 'block3',
    title: 'Block 3: Retrospektive nach dem DAKI-Prinzip',
    description: 'Drop, Add, Keep, Improve',
    questions: [
      // DROP
      { id: 'h_drop', type: 'header', text: 'DROP – Was lassen wir künftig bewusst weg?' },
      {
        id: 'b3_drop_1',
        type: 'textarea',
        text: 'Was darf in dieser Form nicht noch einmal passieren?'
      },
      {
        id: 'b3_drop_2',
        type: 'textarea',
        text: 'Welche Arbeitsweisen, Meetings oder Denkweisen blockieren uns?'
      },
      // ADD
      { id: 'h_add', type: 'header', text: 'ADD – Was sollten wir neu ausprobieren?' },
      {
        id: 'b3_add_1',
        type: 'textarea',
        text: 'Was sollten wir unbedingt ausprobieren, auch wenn es ungewohnt oder risikobehaftet ist?'
      },
      {
        id: 'b3_add_2',
        type: 'textarea',
        text: 'Welche Fähigkeiten, Perspektiven oder Kompetenzen fehlen uns aktuell?'
      },
      // KEEP
      { id: 'h_keep', type: 'header', text: 'KEEP – Was behalten wir unbedingt bei?' },
      {
        id: 'b3_keep_1',
        type: 'textarea',
        text: 'Was hat in der Vergangenheit wirklich gut funktioniert?'
      },
      {
        id: 'b3_keep_2',
        type: 'textarea',
        text: 'Was sollten wir auf keinen Fall verlieren oder kaputt optimieren?'
      },
      // IMPROVE
      { id: 'h_improve', type: 'header', text: 'IMPROVE – Wo werden wir besser?' },
      {
        id: 'b3_improve_1',
        type: 'textarea',
        text: 'Wo haben wir das größte Potenzial, deutlich besser zu werden?'
      },
      {
        id: 'b3_improve_2',
        type: 'textarea',
        text: 'Was müsste sich ändern, damit Du Deine Stärken besser einbringen kannst?'
      }
    ]
  },
  {
    id: 'block4',
    title: 'Block 4: Zusammenarbeit & Team',
    questions: [
      {
        id: 'b4_collab_good',
        type: 'textarea',
        text: 'Wo funktioniert die Zusammenarbeit zwischen Technik, Produktmanagement und Business Development gut?'
      },
      {
        id: 'b4_friction',
        type: 'textarea',
        text: 'Wo reibt es sich aktuell – und was sind aus Deiner Sicht die Ursachen?'
      },
      {
        id: 'b4_transparency',
        type: 'select',
        text: 'Wie transparent empfindest Du Prioritäten, Entscheidungen und Zielsetzungen?',
        options: ['Sehr transparent', 'Teilweise', 'Wenig', 'Gar nicht'],
        helperText: '(gern unten erläutern)'
      },
      {
        id: 'b4_transparency_comment',
        type: 'textarea',
        text: 'Erläuterung zur Transparenz (optional):'
      },
      {
        id: 'b4_needs',
        type: 'textarea',
        text: 'Was brauchst Du konkret von anderen Rollen oder Bereichen, um besser arbeiten zu können?'
      }
    ]
  },
  {
    id: 'block5',
    title: 'Block 5: Blick nach vorn',
    questions: [
      {
        id: 'b5_success_metrics',
        type: 'textarea',
        text: 'Woran würdest Du erkennen, dass Business Development hier gut funktioniert?'
      },
      {
        id: 'b5_6months',
        type: 'textarea',
        text: 'Was müsste sich in den nächsten 6 Monaten spürbar verändert haben, damit Du sagst: „Das bringt uns wirklich weiter“?'
      },
      {
        id: 'b5_wish',
        type: 'textarea',
        text: 'Wenn Du einen Wunsch frei hättest: Was sollten wir anders machen?'
      },
      {
        id: 'b5_misc',
        type: 'textarea',
        text: 'Gibt es etwas Wichtiges, das wir noch nicht angesprochen haben, das aber relevant ist?'
      }
    ]
  }
];