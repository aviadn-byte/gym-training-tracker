import type { Equipment, Exercise, MuscleGroup } from '../../types/models';

type SeedExercise = Omit<Exercise, 'createdAt' | 'updatedAt'>;
type SeedRow = [
  id: string,
  nameHe: string,
  nameEn: string,
  primaryMuscles: MuscleGroup[],
  secondaryMuscles: MuscleGroup[],
  equipment: Equipment,
  weightIncrementKg?: 1 | 2 | 2.5 | 5
];

const rows: SeedRow[] = [
  [
    'bench_press_barbell',
    'לחיצת חזה במוט',
    'Barbell Bench Press',
    ['chest'],
    ['triceps', 'shoulders'],
    'barbell'
  ],
  [
    'incline_bench_press_barbell',
    'לחיצת חזה בשיפוע חיובי במוט',
    'Incline Barbell Bench Press',
    ['chest'],
    ['shoulders', 'triceps'],
    'barbell'
  ],
  [
    'decline_bench_press_barbell',
    'לחיצת חזה בשיפוע שלילי במוט',
    'Decline Barbell Bench Press',
    ['chest'],
    ['triceps', 'shoulders'],
    'barbell'
  ],
  [
    'close_grip_bench_press',
    'לחיצת חזה אחיזה צרה',
    'Close Grip Bench Press',
    ['triceps', 'chest'],
    ['shoulders'],
    'barbell'
  ],
  [
    'bench_press_dumbbell',
    'לחיצת חזה בדאמבלים',
    'Dumbbell Bench Press',
    ['chest'],
    ['triceps', 'shoulders'],
    'dumbbell'
  ],
  [
    'incline_dumbbell_press',
    'לחיצת חזה בשיפוע בדאמבלים',
    'Incline Dumbbell Press',
    ['chest'],
    ['shoulders', 'triceps'],
    'dumbbell'
  ],
  [
    'decline_dumbbell_press',
    'לחיצת חזה שלילי בדאמבלים',
    'Decline Dumbbell Press',
    ['chest'],
    ['triceps'],
    'dumbbell'
  ],
  ['dumbbell_fly', 'פרפר בדאמבלים', 'Dumbbell Fly', ['chest'], ['shoulders'], 'dumbbell', 1],
  [
    'incline_dumbbell_fly',
    'פרפר בשיפוע בדאמבלים',
    'Incline Dumbbell Fly',
    ['chest'],
    ['shoulders'],
    'dumbbell',
    1
  ],
  ['cable_fly', 'פרפר בכבלים', 'Cable Fly', ['chest'], ['shoulders'], 'cable', 1],
  [
    'low_to_high_cable_fly',
    'פרפר כבלים מלמטה למעלה',
    'Low to High Cable Fly',
    ['chest'],
    ['shoulders'],
    'cable',
    1
  ],
  ['pec_deck', 'פרפר במכונה', 'Pec Deck', ['chest'], ['shoulders'], 'machine', 2],
  [
    'machine_chest_press',
    'לחיצת חזה במכונה',
    'Machine Chest Press',
    ['chest'],
    ['triceps', 'shoulders'],
    'machine'
  ],
  [
    'incline_machine_press',
    'לחיצת חזה עליון במכונה',
    'Incline Machine Press',
    ['chest'],
    ['shoulders', 'triceps'],
    'machine'
  ],
  ['push_up', 'שכיבות סמיכה', 'Push Up', ['chest'], ['triceps', 'shoulders', 'core'], 'bodyweight'],
  [
    'weighted_push_up',
    'שכיבות סמיכה עם משקל',
    'Weighted Push Up',
    ['chest'],
    ['triceps', 'shoulders', 'core'],
    'bodyweight'
  ],
  ['chest_dip', 'מקבילים לחזה', 'Chest Dip', ['chest'], ['triceps', 'shoulders'], 'bodyweight'],
  [
    'smith_bench_press',
    'לחיצת חזה בסמית׳',
    'Smith Machine Bench Press',
    ['chest'],
    ['triceps', 'shoulders'],
    'smith'
  ],
  [
    'floor_press',
    'לחיצת רצפה במוט',
    'Barbell Floor Press',
    ['chest', 'triceps'],
    ['shoulders'],
    'barbell'
  ],
  [
    'landmine_chest_press',
    'לחיצת חזה לנדמיין',
    'Landmine Chest Press',
    ['chest'],
    ['shoulders', 'triceps'],
    'barbell'
  ],
  ['pull_up', 'מתח', 'Pull Up', ['back'], ['biceps', 'forearms'], 'bodyweight'],
  [
    'weighted_pull_up',
    'מתח עם משקל',
    'Weighted Pull Up',
    ['back'],
    ['biceps', 'forearms'],
    'bodyweight'
  ],
  ['chin_up', 'מתח בנות', 'Chin Up', ['back', 'biceps'], ['forearms'], 'bodyweight'],
  ['lat_pulldown', 'פולי עליון', 'Lat Pulldown', ['back'], ['biceps', 'forearms'], 'cable'],
  [
    'close_grip_lat_pulldown',
    'פולי עליון אחיזה צרה',
    'Close Grip Lat Pulldown',
    ['back'],
    ['biceps'],
    'cable'
  ],
  [
    'wide_grip_lat_pulldown',
    'פולי עליון אחיזה רחבה',
    'Wide Grip Lat Pulldown',
    ['back'],
    ['biceps'],
    'cable'
  ],
  [
    'single_arm_lat_pulldown',
    'פולי עליון יד אחת',
    'Single Arm Lat Pulldown',
    ['back'],
    ['biceps'],
    'cable',
    1
  ],
  [
    'straight_arm_pulldown',
    'פולאובר בכבל ישר',
    'Straight Arm Pulldown',
    ['back'],
    ['triceps'],
    'cable',
    1
  ],
  [
    'barbell_row',
    'חתירה במוט',
    'Barbell Row',
    ['back'],
    ['biceps', 'forearms', 'traps'],
    'barbell'
  ],
  [
    'pendlay_row',
    'חתירת פנדלי',
    'Pendlay Row',
    ['back'],
    ['biceps', 'traps', 'forearms'],
    'barbell'
  ],
  ['t_bar_row', 'חתירת T-Bar', 'T-Bar Row', ['back'], ['biceps', 'traps'], 'machine'],
  ['seal_row', 'חתירה על ספסל', 'Seal Row', ['back'], ['biceps', 'traps'], 'barbell'],
  [
    'single_arm_dumbbell_row',
    'חתירת דאמבל יד אחת',
    'Single Arm Dumbbell Row',
    ['back'],
    ['biceps', 'forearms'],
    'dumbbell'
  ],
  [
    'chest_supported_dumbbell_row',
    'חתירה נתמכת חזה בדאמבלים',
    'Chest Supported Dumbbell Row',
    ['back'],
    ['biceps', 'traps'],
    'dumbbell'
  ],
  [
    'seated_row_cable',
    'חתירה בישיבה בכבל',
    'Seated Cable Row',
    ['back'],
    ['biceps', 'forearms'],
    'cable'
  ],
  ['machine_row', 'חתירה במכונה', 'Machine Row', ['back'], ['biceps', 'traps'], 'machine'],
  [
    'high_row_machine',
    'חתירה גבוהה במכונה',
    'High Row Machine',
    ['back'],
    ['biceps', 'traps'],
    'machine'
  ],
  ['inverted_row', 'חתירה הפוכה', 'Inverted Row', ['back'], ['biceps', 'core'], 'bodyweight'],
  ['face_pull', 'פייס פול', 'Face Pull', ['shoulders', 'traps'], ['back'], 'cable', 1],
  [
    'reverse_cable_fly',
    'פרפר הפוך בכבלים',
    'Reverse Cable Fly',
    ['shoulders'],
    ['traps'],
    'cable',
    1
  ],
  [
    'reverse_pec_deck',
    'פרפר הפוך במכונה',
    'Reverse Pec Deck',
    ['shoulders'],
    ['traps', 'back'],
    'machine',
    2
  ],
  [
    'back_extension',
    'פשיטת גב',
    'Back Extension',
    ['back', 'glutes'],
    ['hamstrings'],
    'bodyweight'
  ],
  [
    'rack_pull',
    'ראק פול',
    'Rack Pull',
    ['back', 'traps'],
    ['glutes', 'hamstrings', 'forearms'],
    'barbell',
    5
  ],
  ['machine_pullover', 'פולאובר במכונה', 'Machine Pullover', ['back'], ['chest'], 'machine'],
  ['meadows_row', 'חתירת מדוז', 'Meadows Row', ['back'], ['biceps', 'traps'], 'barbell'],
  [
    'barbell_overhead_press',
    'לחיצת כתפיים במוט',
    'Barbell Overhead Press',
    ['shoulders'],
    ['triceps', 'core'],
    'barbell'
  ],
  [
    'seated_barbell_press',
    'לחיצת כתפיים בישיבה במוט',
    'Seated Barbell Press',
    ['shoulders'],
    ['triceps'],
    'barbell'
  ],
  [
    'dumbbell_shoulder_press',
    'לחיצת כתפיים בדאמבלים',
    'Dumbbell Shoulder Press',
    ['shoulders'],
    ['triceps'],
    'dumbbell'
  ],
  [
    'seated_dumbbell_press',
    'לחיצת כתפיים בישיבה בדאמבלים',
    'Seated Dumbbell Shoulder Press',
    ['shoulders'],
    ['triceps'],
    'dumbbell'
  ],
  ['arnold_press', 'לחיצת ארנולד', 'Arnold Press', ['shoulders'], ['triceps'], 'dumbbell', 1],
  [
    'machine_shoulder_press',
    'לחיצת כתפיים במכונה',
    'Machine Shoulder Press',
    ['shoulders'],
    ['triceps'],
    'machine'
  ],
  [
    'smith_shoulder_press',
    'לחיצת כתפיים בסמית׳',
    'Smith Machine Shoulder Press',
    ['shoulders'],
    ['triceps'],
    'smith'
  ],
  [
    'dumbbell_lateral_raise',
    'הרחקת כתפיים בדאמבלים',
    'Dumbbell Lateral Raise',
    ['shoulders'],
    [],
    'dumbbell',
    1
  ],
  ['cable_lateral_raise', 'הרחקת כתף בכבל', 'Cable Lateral Raise', ['shoulders'], [], 'cable', 1],
  [
    'machine_lateral_raise',
    'הרחקת כתפיים במכונה',
    'Machine Lateral Raise',
    ['shoulders'],
    [],
    'machine',
    2
  ],
  [
    'leaning_cable_lateral_raise',
    'הרחקת כתף בכבל בהטיה',
    'Leaning Cable Lateral Raise',
    ['shoulders'],
    [],
    'cable',
    1
  ],
  [
    'dumbbell_rear_delt_raise',
    'הרחקה אחורית בדאמבלים',
    'Dumbbell Rear Delt Raise',
    ['shoulders'],
    ['traps'],
    'dumbbell',
    1
  ],
  [
    'rear_delt_row',
    'חתירה לדלתא אחורית',
    'Rear Delt Row',
    ['shoulders'],
    ['back', 'traps'],
    'dumbbell',
    1
  ],
  [
    'dumbbell_front_raise',
    'הרמת כתפיים קדמית בדאמבלים',
    'Dumbbell Front Raise',
    ['shoulders'],
    ['chest'],
    'dumbbell',
    1
  ],
  ['cable_front_raise', 'הרמה קדמית בכבל', 'Cable Front Raise', ['shoulders'], [], 'cable', 1],
  ['upright_row', 'חתירה אנכית', 'Upright Row', ['shoulders', 'traps'], ['biceps'], 'barbell', 1],
  [
    'landmine_press',
    'לחיצת לנדמיין',
    'Landmine Press',
    ['shoulders'],
    ['chest', 'triceps', 'core'],
    'barbell'
  ],
  [
    'pike_push_up',
    'שכיבות סמיכה פייק',
    'Pike Push Up',
    ['shoulders'],
    ['triceps', 'core'],
    'bodyweight'
  ],
  [
    'handstand_push_up',
    'שכיבות סמיכה עמידת ידיים',
    'Handstand Push Up',
    ['shoulders'],
    ['triceps', 'core'],
    'bodyweight'
  ],
  ['y_raise', 'הרמת Y', 'Y Raise', ['shoulders'], ['traps'], 'dumbbell', 1],
  ['cuban_press', 'לחיצה קובנית', 'Cuban Press', ['shoulders'], ['traps'], 'dumbbell', 1],
  ['barbell_shrug', 'שראג במוט', 'Barbell Shrug', ['traps'], ['forearms'], 'barbell', 5],
  ['dumbbell_shrug', 'שראג בדאמבלים', 'Dumbbell Shrug', ['traps'], ['forearms'], 'dumbbell'],
  ['barbell_curl', 'כפיפת מרפקים במוט', 'Barbell Curl', ['biceps'], ['forearms'], 'barbell', 1],
  ['ez_bar_curl', 'כפיפת מרפקים במוט EZ', 'EZ Bar Curl', ['biceps'], ['forearms'], 'barbell', 1],
  [
    'dumbbell_curl',
    'כפיפת מרפקים בדאמבלים',
    'Dumbbell Curl',
    ['biceps'],
    ['forearms'],
    'dumbbell',
    1
  ],
  [
    'alternating_dumbbell_curl',
    'כפיפה לסירוגין בדאמבלים',
    'Alternating Dumbbell Curl',
    ['biceps'],
    ['forearms'],
    'dumbbell',
    1
  ],
  [
    'incline_dumbbell_curl',
    'כפיפה בשיפוע בדאמבלים',
    'Incline Dumbbell Curl',
    ['biceps'],
    ['forearms'],
    'dumbbell',
    1
  ],
  ['hammer_curl', 'פטישים', 'Hammer Curl', ['biceps', 'forearms'], [], 'dumbbell', 1],
  ['preacher_curl', 'כפיפה בכיסא כומר', 'Preacher Curl', ['biceps'], ['forearms'], 'machine', 1],
  [
    'machine_preacher_curl',
    'כפיפה כומר במכונה',
    'Machine Preacher Curl',
    ['biceps'],
    ['forearms'],
    'machine',
    1
  ],
  ['cable_curl', 'כפיפת מרפקים בכבל', 'Cable Curl', ['biceps'], ['forearms'], 'cable', 1],
  [
    'bayesian_cable_curl',
    'כפיפה בייסיאנית בכבל',
    'Bayesian Cable Curl',
    ['biceps'],
    ['forearms'],
    'cable',
    1
  ],
  [
    'concentration_curl',
    'כפיפה מרוכזת',
    'Concentration Curl',
    ['biceps'],
    ['forearms'],
    'dumbbell',
    1
  ],
  ['spider_curl', 'ספיידר קארל', 'Spider Curl', ['biceps'], ['forearms'], 'dumbbell', 1],
  ['reverse_curl', 'כפיפה הפוכה', 'Reverse Curl', ['forearms', 'biceps'], [], 'barbell', 1],
  ['zottman_curl', 'כפיפת זוטמן', 'Zottman Curl', ['biceps', 'forearms'], [], 'dumbbell', 1],
  ['wrist_curl', 'כפיפת שורש כף יד', 'Wrist Curl', ['forearms'], [], 'dumbbell', 1],
  [
    'reverse_wrist_curl',
    'כפיפת שורש כף יד הפוכה',
    'Reverse Wrist Curl',
    ['forearms'],
    [],
    'dumbbell',
    1
  ],
  ['farmer_carry', 'הליכת איכר', 'Farmer Carry', ['forearms', 'traps'], ['core'], 'dumbbell', 5],
  ['cable_rope_pushdown', 'פשיטת מרפקים בחבל', 'Cable Rope Pushdown', ['triceps'], [], 'cable', 1],
  [
    'cable_bar_pushdown',
    'פשיטת מרפקים במוט בכבל',
    'Cable Bar Pushdown',
    ['triceps'],
    [],
    'cable',
    1
  ],
  [
    'single_arm_pushdown',
    'פשיטת מרפק יד אחת בכבל',
    'Single Arm Cable Pushdown',
    ['triceps'],
    [],
    'cable',
    1
  ],
  [
    'overhead_cable_extension',
    'פשיטת מרפק מעל הראש בכבל',
    'Overhead Cable Extension',
    ['triceps'],
    [],
    'cable',
    1
  ],
  ['skull_crusher', 'סקאל קראשר', 'Skull Crusher', ['triceps'], ['chest'], 'barbell', 1],
  [
    'dumbbell_overhead_extension',
    'פשיטת מרפק מעל הראש בדאמבל',
    'Dumbbell Overhead Extension',
    ['triceps'],
    [],
    'dumbbell',
    1
  ],
  ['dumbbell_kickback', 'קיקבק בדאמבל', 'Dumbbell Kickback', ['triceps'], [], 'dumbbell', 1],
  [
    'triceps_dip',
    'מקבילים יד אחורית',
    'Triceps Dip',
    ['triceps'],
    ['chest', 'shoulders'],
    'bodyweight'
  ],
  ['machine_dip', 'מקבילים במכונה', 'Machine Dip', ['triceps'], ['chest'], 'machine'],
  ['jm_press', 'JM Press', 'JM Press', ['triceps'], ['chest', 'shoulders'], 'barbell', 1],
  ['french_press', 'לחיצה צרפתית', 'French Press', ['triceps'], [], 'barbell', 1],
  [
    'crossbody_cable_extension',
    'פשיטת מרפק אלכסונית בכבל',
    'Crossbody Cable Extension',
    ['triceps'],
    [],
    'cable',
    1
  ],
  [
    'smith_close_grip_press',
    'לחיצה צרה בסמית׳',
    'Smith Close Grip Press',
    ['triceps', 'chest'],
    ['shoulders'],
    'smith'
  ],
  [
    'bodyweight_triceps_extension',
    'פשיטת מרפקים משקל גוף',
    'Bodyweight Triceps Extension',
    ['triceps'],
    ['core'],
    'bodyweight'
  ],
  [
    'barbell_back_squat',
    'סקוואט במוט',
    'Barbell Back Squat',
    ['quads', 'glutes'],
    ['hamstrings', 'core'],
    'barbell'
  ],
  ['front_squat', 'פרונט סקוואט', 'Front Squat', ['quads'], ['glutes', 'core', 'back'], 'barbell'],
  ['goblet_squat', 'גובלט סקוואט', 'Goblet Squat', ['quads', 'glutes'], ['core'], 'dumbbell'],
  ['hack_squat', 'האק סקוואט', 'Hack Squat', ['quads'], ['glutes'], 'machine'],
  [
    'pendulum_squat',
    'פנדולום סקוואט',
    'Pendulum Squat',
    ['quads', 'glutes'],
    ['hamstrings'],
    'machine'
  ],
  ['leg_press', 'לחיצת רגליים', 'Leg Press', ['quads', 'glutes'], ['hamstrings'], 'machine', 5],
  [
    'single_leg_press',
    'לחיצת רגל אחת',
    'Single Leg Press',
    ['quads', 'glutes'],
    ['hamstrings'],
    'machine'
  ],
  [
    'bulgarian_split_squat',
    'סקוואט בולגרי',
    'Bulgarian Split Squat',
    ['quads', 'glutes'],
    ['hamstrings', 'core'],
    'dumbbell'
  ],
  [
    'walking_lunge',
    'מכרעים בהליכה',
    'Walking Lunge',
    ['quads', 'glutes'],
    ['hamstrings', 'core'],
    'dumbbell'
  ],
  ['reverse_lunge', 'מכרע לאחור', 'Reverse Lunge', ['quads', 'glutes'], ['hamstrings'], 'dumbbell'],
  ['forward_lunge', 'מכרע קדימה', 'Forward Lunge', ['quads', 'glutes'], ['hamstrings'], 'dumbbell'],
  ['step_up', 'עלייה לקופסה', 'Step Up', ['quads', 'glutes'], ['hamstrings', 'core'], 'dumbbell'],
  ['leg_extension', 'פשיטת ברכיים', 'Leg Extension', ['quads'], [], 'machine', 2],
  ['sissy_squat', 'סיסי סקוואט', 'Sissy Squat', ['quads'], ['core'], 'bodyweight'],
  [
    'smith_squat',
    'סקוואט בסמית׳',
    'Smith Machine Squat',
    ['quads', 'glutes'],
    ['hamstrings'],
    'smith'
  ],
  ['belt_squat', 'בלט סקוואט', 'Belt Squat', ['quads', 'glutes'], ['hamstrings'], 'machine'],
  ['box_squat', 'בוקס סקוואט', 'Box Squat', ['quads', 'glutes'], ['hamstrings'], 'barbell'],
  [
    'zercher_squat',
    'זרצ׳ר סקוואט',
    'Zercher Squat',
    ['quads', 'glutes'],
    ['core', 'back'],
    'barbell'
  ],
  ['landmine_squat', 'לנדמיין סקוואט', 'Landmine Squat', ['quads', 'glutes'], ['core'], 'barbell'],
  ['wall_sit', 'ישיבת קיר', 'Wall Sit', ['quads'], ['glutes'], 'bodyweight'],
  ['sled_push', 'דחיפת מזחלת', 'Sled Push', ['quads', 'glutes'], ['calves', 'core'], 'other', 5],
  ['spanish_squat', 'סקוואט ספרדי', 'Spanish Squat', ['quads'], [], 'band'],
  [
    'cossack_squat',
    'קוזאק סקוואט',
    'Cossack Squat',
    ['quads', 'adductors'],
    ['glutes'],
    'bodyweight'
  ],
  [
    'barbell_deadlift',
    'דדליפט במוט',
    'Barbell Deadlift',
    ['back', 'glutes', 'hamstrings'],
    ['traps', 'forearms', 'core'],
    'barbell',
    5
  ],
  [
    'sumo_deadlift',
    'דדליפט סומו',
    'Sumo Deadlift',
    ['glutes', 'hamstrings', 'back'],
    ['quads', 'forearms'],
    'barbell',
    5
  ],
  [
    'trap_bar_deadlift',
    'דדליפט טראפ בר',
    'Trap Bar Deadlift',
    ['glutes', 'quads', 'back'],
    ['hamstrings', 'forearms'],
    'barbell',
    5
  ],
  [
    'romanian_deadlift',
    'דדליפט רומני',
    'Romanian Deadlift',
    ['hamstrings', 'glutes'],
    ['back', 'forearms'],
    'barbell'
  ],
  [
    'stiff_leg_deadlift',
    'דדליפט רגליים ישרות',
    'Stiff Leg Deadlift',
    ['hamstrings', 'glutes'],
    ['back'],
    'barbell'
  ],
  [
    'single_leg_rdl',
    'דדליפט רומני רגל אחת',
    'Single Leg Romanian Deadlift',
    ['hamstrings', 'glutes'],
    ['core'],
    'dumbbell'
  ],
  [
    'good_morning',
    'גוד מורנינג',
    'Good Morning',
    ['hamstrings', 'glutes'],
    ['back', 'core'],
    'barbell'
  ],
  [
    'barbell_hip_thrust',
    'היפ טראסט במוט',
    'Barbell Hip Thrust',
    ['glutes'],
    ['hamstrings', 'quads'],
    'barbell'
  ],
  [
    'machine_hip_thrust',
    'היפ טראסט במכונה',
    'Machine Hip Thrust',
    ['glutes'],
    ['hamstrings'],
    'machine'
  ],
  ['glute_bridge', 'גשר ישבן', 'Glute Bridge', ['glutes'], ['hamstrings'], 'bodyweight'],
  [
    'cable_pull_through',
    'פול ת׳רו בכבל',
    'Cable Pull Through',
    ['glutes', 'hamstrings'],
    ['back'],
    'cable'
  ],
  [
    'lying_leg_curl',
    'כפיפת ברכיים בשכיבה',
    'Lying Leg Curl',
    ['hamstrings'],
    ['calves'],
    'machine',
    2
  ],
  [
    'seated_leg_curl',
    'כפיפת ברכיים בישיבה',
    'Seated Leg Curl',
    ['hamstrings'],
    ['calves'],
    'machine',
    2
  ],
  ['standing_leg_curl', 'כפיפת ברך בעמידה', 'Standing Leg Curl', ['hamstrings'], [], 'machine', 1],
  ['nordic_curl', 'נורדיק קארל', 'Nordic Hamstring Curl', ['hamstrings'], ['glutes'], 'bodyweight'],
  [
    'glute_ham_raise',
    'Glute Ham Raise',
    'Glute Ham Raise',
    ['hamstrings', 'glutes'],
    ['calves'],
    'machine'
  ],
  [
    'kettlebell_swing',
    'סווינג קטלבל',
    'Kettlebell Swing',
    ['glutes', 'hamstrings'],
    ['back', 'core'],
    'kettlebell'
  ],
  [
    'reverse_hyperextension',
    'ריוורס הייפר',
    'Reverse Hyperextension',
    ['glutes', 'hamstrings'],
    ['back'],
    'machine'
  ],
  [
    'glute_back_extension',
    'פשיטת גב בדגש ישבן',
    'Glute Focused Back Extension',
    ['glutes', 'hamstrings'],
    ['back'],
    'bodyweight'
  ],
  [
    'cable_kickback',
    'קיקבק בכבל לישבן',
    'Cable Glute Kickback',
    ['glutes'],
    ['hamstrings'],
    'cable',
    1
  ],
  ['frog_pump', 'Frog Pump', 'Frog Pump', ['glutes'], [], 'bodyweight'],
  [
    'hamstring_slider_curl',
    'כפיפת המסטרינג עם סליידר',
    'Hamstring Slider Curl',
    ['hamstrings'],
    ['glutes'],
    'bodyweight'
  ],
  ['standing_calf_raise', 'הרמת עקבים בעמידה', 'Standing Calf Raise', ['calves'], [], 'machine', 2],
  ['seated_calf_raise', 'הרמת עקבים בישיבה', 'Seated Calf Raise', ['calves'], [], 'machine', 2],
  ['donkey_calf_raise', 'הרמת עקבים דונקי', 'Donkey Calf Raise', ['calves'], [], 'machine', 2],
  [
    'leg_press_calf_raise',
    'הרמת עקבים בלג פרס',
    'Leg Press Calf Raise',
    ['calves'],
    [],
    'machine',
    5
  ],
  [
    'single_leg_calf_raise',
    'הרמת עקב רגל אחת',
    'Single Leg Calf Raise',
    ['calves'],
    [],
    'bodyweight'
  ],
  ['tibialis_raise', 'הרמת טיביאליס', 'Tibialis Raise', ['calves'], [], 'bodyweight'],
  [
    'adductor_machine',
    'מקרבים במכונה',
    'Hip Adductor Machine',
    ['adductors'],
    ['glutes'],
    'machine',
    2
  ],
  ['cable_hip_adduction', 'קירוב ירך בכבל', 'Cable Hip Adduction', ['adductors'], [], 'cable', 1],
  [
    'copenhagen_plank',
    'פלאנק קופנהגן',
    'Copenhagen Plank',
    ['adductors', 'core'],
    [],
    'bodyweight'
  ],
  [
    'abductor_machine',
    'מרחיקים במכונה',
    'Hip Abductor Machine',
    ['abductors', 'glutes'],
    [],
    'machine',
    2
  ],
  [
    'cable_hip_abduction',
    'הרחקת ירך בכבל',
    'Cable Hip Abduction',
    ['abductors', 'glutes'],
    [],
    'cable',
    1
  ],
  [
    'banded_lateral_walk',
    'הליכת צד עם גומייה',
    'Banded Lateral Walk',
    ['abductors', 'glutes'],
    [],
    'band'
  ],
  ['plank', 'פלאנק', 'Plank', ['core'], ['shoulders'], 'bodyweight'],
  ['side_plank', 'פלאנק צד', 'Side Plank', ['core'], ['shoulders'], 'bodyweight'],
  ['dead_bug', 'דד באג', 'Dead Bug', ['core'], [], 'bodyweight'],
  ['hollow_hold', 'הולו הולד', 'Hollow Hold', ['core'], [], 'bodyweight'],
  [
    'hanging_leg_raise',
    'הרמת רגליים בתלייה',
    'Hanging Leg Raise',
    ['core'],
    ['forearms'],
    'bodyweight'
  ],
  [
    'captains_chair_leg_raise',
    'הרמת רגליים בכיסא רומי',
    'Captains Chair Leg Raise',
    ['core'],
    [],
    'machine'
  ],
  ['cable_crunch', 'כפיפות בטן בכבל', 'Cable Crunch', ['core'], [], 'cable', 1],
  ['machine_crunch', 'כפיפות בטן במכונה', 'Machine Crunch', ['core'], [], 'machine', 2],
  ['ab_wheel', 'גלגל בטן', 'Ab Wheel Rollout', ['core'], ['shoulders'], 'other'],
  ['pallof_press', 'פאלוף פרס', 'Pallof Press', ['core'], ['shoulders'], 'cable', 1],
  ['russian_twist', 'רוסיאן טוויסט', 'Russian Twist', ['core'], [], 'plate'],
  ['weighted_sit_up', 'כפיפות בטן עם משקל', 'Weighted Sit Up', ['core'], [], 'plate'],
  ['decline_sit_up', 'כפיפות בטן בשיפוע שלילי', 'Decline Sit Up', ['core'], [], 'bodyweight'],
  ['cable_woodchop', 'חטיבת עץ בכבל', 'Cable Woodchop', ['core'], ['shoulders'], 'cable', 1],
  [
    'suitcase_carry',
    'הליכת מזוודה',
    'Suitcase Carry',
    ['core', 'forearms'],
    ['traps'],
    'dumbbell',
    5
  ],
  ['bird_dog', 'בירד דוג', 'Bird Dog', ['core'], ['glutes'], 'bodyweight'],
  [
    'power_clean',
    'פאוור קלין',
    'Power Clean',
    ['fullBody'],
    ['traps', 'glutes', 'hamstrings'],
    'barbell',
    5
  ],
  ['clean_pull', 'קלין פול', 'Clean Pull', ['fullBody'], ['traps', 'back', 'glutes'], 'barbell', 5],
  [
    'power_snatch',
    'פאוור סנאץ׳',
    'Power Snatch',
    ['fullBody'],
    ['shoulders', 'traps', 'glutes'],
    'barbell',
    5
  ],
  [
    'barbell_thruster',
    'תראסטר במוט',
    'Barbell Thruster',
    ['fullBody'],
    ['quads', 'shoulders', 'triceps'],
    'barbell'
  ],
  [
    'dumbbell_thruster',
    'תראסטר בדאמבלים',
    'Dumbbell Thruster',
    ['fullBody'],
    ['quads', 'shoulders', 'triceps'],
    'dumbbell'
  ],
  [
    'turkish_get_up',
    'קימה טורקית',
    'Turkish Get Up',
    ['fullBody'],
    ['core', 'shoulders', 'glutes'],
    'kettlebell',
    1
  ],
  [
    'renegade_row',
    'רנגייד רואו',
    'Renegade Row',
    ['back', 'core'],
    ['shoulders', 'triceps'],
    'dumbbell'
  ],
  ['burpee', 'ברפי', 'Burpee', ['fullBody'], ['chest', 'quads', 'core'], 'bodyweight'],
  [
    'sled_drag',
    'גרירת מזחלת',
    'Sled Drag',
    ['quads', 'glutes'],
    ['hamstrings', 'calves'],
    'other',
    5
  ],
  [
    'medicine_ball_slam',
    'הטחת כדור כוח',
    'Medicine Ball Slam',
    ['fullBody'],
    ['core', 'shoulders'],
    'other'
  ],
  [
    'battle_rope_waves',
    'חבלי קרב',
    'Battle Rope Waves',
    ['shoulders', 'core'],
    ['forearms'],
    'other'
  ]
];

export const seedExercises: SeedExercise[] = rows.map(
  ([id, nameHe, nameEn, primaryMuscles, secondaryMuscles, equipment, weightIncrementKg = 2.5]) => ({
    id,
    nameHe,
    nameEn,
    primaryMuscles,
    secondaryMuscles,
    equipment,
    isCustom: false,
    notes: '',
    weightIncrementKg
  })
);
