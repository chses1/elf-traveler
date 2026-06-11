export const characterSkills = [
  {
    "id": "player_male",
    "name": "小中",
    "districtId": null,
    "role": "玩家主角",
    "element": [
      "探索",
      "光"
    ],
    "skills": [
      {
        "id": "player_male_01",
        "tier": "low",
        "tierName": "低階",
        "name": "旅人光標",
        "energyCost": 2,
        "skillType": "single_attack",
        "target": "enemy_single",
        "description": "用魔法地圖標記一名敵人，射出一道探索光線造成小量傷害。",
        "effect": {
          "damageMultiplier": 1
        },
        "battleText": "小中展開魔法地圖，旅人光標命中敵人！"
      },
      {
        "id": "player_male_02",
        "tier": "mid",
        "tierName": "中階",
        "name": "探索號令",
        "energyCost": 3,
        "skillType": "buff_damage",
        "target": "ally_all",
        "description": "用指南針與地圖規劃路線，提升全隊下一次攻擊傷害。",
        "effect": {
          "buff": "damage_up",
          "value": 0.2,
          "turns": 2
        },
        "battleText": "小中指向前方，全隊看清了最佳進攻路線！"
      },
      {
        "id": "player_male_03",
        "tier": "high",
        "tierName": "高階",
        "name": "十三區星路",
        "energyCost": 5,
        "skillType": "all_attack",
        "target": "enemy_all",
        "description": "展開桃園十三區的星光路線，對全體敵人造成大量光屬性傷害。",
        "effect": {
          "damageMultiplier": 2.7
        },
        "battleText": "十三區星路展開，光軌掃過所有敵人！"
      }
    ]
  },
  {
    "id": "player_female",
    "name": "小珊",
    "districtId": null,
    "role": "玩家主角",
    "element": [
      "探索",
      "花"
    ],
    "skills": [
      {
        "id": "player_female_01",
        "tier": "low",
        "tierName": "低階",
        "name": "旅人光標",
        "energyCost": 2,
        "skillType": "single_attack",
        "target": "enemy_single",
        "description": "用魔法地圖標記一名敵人，射出一道探索光線造成小量傷害。",
        "effect": {
          "damageMultiplier": 1
        },
        "battleText": "小珊展開魔法地圖，旅人光標命中敵人！"
      },
      {
        "id": "player_female_02",
        "tier": "mid",
        "tierName": "中階",
        "name": "探索號令",
        "energyCost": 3,
        "skillType": "buff_damage",
        "target": "ally_all",
        "description": "用指南針與地圖規劃路線，提升全隊下一次攻擊傷害。",
        "effect": {
          "buff": "damage_up",
          "value": 0.2,
          "turns": 2
        },
        "battleText": "小珊指向前方，全隊看清了最佳進攻路線！"
      },
      {
        "id": "player_female_03",
        "tier": "high",
        "tierName": "高階",
        "name": "十三區星路",
        "energyCost": 5,
        "skillType": "all_attack",
        "target": "enemy_all",
        "description": "展開桃園十三區的星光路線，對全體敵人造成大量光屬性傷害。",
        "effect": {
          "damageMultiplier": 2.7
        },
        "battleText": "十三區星路展開，光軌掃過所有敵人！"
      }
    ]
  },
  {
    "id": "taoyuan_spirit",
    "name": "桃都花靈",
    "districtId": "taoyuan",
    "role": "輔助型精靈",
    "element": [
      "光",
      "花"
    ],
    "skills": [
      {
        "id": "taoyuan_spirit_01",
        "tier": "low",
        "tierName": "低階",
        "name": "桃瓣光彈",
        "energyCost": 2,
        "skillType": "attack_heal",
        "target": "enemy_single",
        "description": "桃花花瓣化成光彈攻擊一名敵人，並讓前位夥伴回復少量生命值。",
        "effect": {
          "damageMultiplier": 0.95,
          "healMultiplier": 0.75
        },
        "battleText": "桃都花靈射出桃瓣光彈，花光也替前位夥伴補充活力！"
      },
      {
        "id": "taoyuan_spirit_02",
        "tier": "mid",
        "tierName": "中階",
        "name": "樹屋守望",
        "energyCost": 3,
        "skillType": "buff_reduce_damage",
        "target": "ally_all",
        "description": "召喚虎頭山樹屋的守護光，降低全隊受到的傷害。",
        "effect": {
          "buff": "damage_taken_down",
          "value": 0.18,
          "turns": 2
        },
        "battleText": "樹屋守望亮起，全隊獲得森林守護！"
      },
      {
        "id": "taoyuan_spirit_03",
        "tier": "high",
        "tierName": "高階",
        "name": "城市花耀",
        "energyCost": 5,
        "skillType": "all_heal",
        "target": "ally_all",
        "description": "桃花與城市微光化成大片光雨，回復全隊生命值。",
        "effect": {
          "healMultiplier": 1.7
        },
        "battleText": "城市花耀綻放，全隊被溫柔光雨治癒！"
      }
    ]
  },
  {
    "id": "guishan_spirit",
    "name": "龜甲機兵",
    "districtId": "guishan",
    "role": "高防禦坦克型精靈",
    "element": [
      "鋼",
      "守護"
    ],
    "skills": [
      {
        "id": "guishan_spirit_01",
        "tier": "low",
        "tierName": "低階",
        "name": "龜甲撞擊",
        "energyCost": 2,
        "skillType": "single_attack",
        "target": "enemy_single",
        "description": "用厚實龜甲向前撞擊一名敵人。",
        "effect": {
          "damageMultiplier": 1.15
        },
        "battleText": "龜甲機兵穩穩衝出，龜甲撞擊命中！"
      },
      {
        "id": "guishan_spirit_02",
        "tier": "mid",
        "tierName": "中階",
        "name": "六角護盾",
        "energyCost": 3,
        "skillType": "buff_reduce_damage",
        "target": "ally_all",
        "description": "展開科技六角護盾，降低全隊受到的傷害。",
        "effect": {
          "buff": "damage_taken_down",
          "value": 0.25,
          "turns": 2
        },
        "battleText": "六角護盾展開，全隊防禦力提升！"
      },
      {
        "id": "guishan_spirit_03",
        "tier": "high",
        "tierName": "高階",
        "name": "智慧城防線",
        "energyCost": 6,
        "skillType": "buff_reduce_damage",
        "target": "ally_all",
        "description": "龜甲科技核心全開，大幅降低全隊受到的傷害。",
        "effect": {
          "buff": "damage_taken_down",
          "value": 0.35,
          "turns": 3
        },
        "battleText": "智慧城防線啟動，隊伍獲得堅固守護！"
      }
    ]
  },
  {
    "id": "luzhu_spirit",
    "name": "竹風鷹",
    "districtId": "luzhu",
    "role": "速度型精靈",
    "element": [
      "風",
      "竹"
    ],
    "skills": [
      {
        "id": "luzhu_spirit_01",
        "tier": "low",
        "tierName": "低階",
        "name": "竹葉風刃",
        "energyCost": 2,
        "skillType": "single_attack",
        "target": "enemy_single",
        "description": "揮出竹葉形風刃，攻擊一名敵人。",
        "effect": {
          "damageMultiplier": 1.05
        },
        "battleText": "竹風鷹振翅，竹葉風刃劃過敵人！"
      },
      {
        "id": "luzhu_spirit_02",
        "tier": "mid",
        "tierName": "中階",
        "name": "大古山順風",
        "energyCost": 3,
        "skillType": "buff_damage",
        "target": "ally_all",
        "description": "山丘順風推動全隊，提升全隊攻擊傷害。",
        "effect": {
          "buff": "damage_up",
          "value": 0.18,
          "turns": 2
        },
        "battleText": "大古山順風吹起，全隊攻勢更快了！"
      },
      {
        "id": "luzhu_spirit_03",
        "tier": "high",
        "tierName": "高階",
        "name": "竹林旋空擊",
        "energyCost": 5,
        "skillType": "all_attack",
        "target": "enemy_all",
        "description": "竹葉與風旋席捲全場，對全體敵人造成傷害。",
        "effect": {
          "damageMultiplier": 2.45
        },
        "battleText": "竹林旋空擊呼嘯而過，所有敵人都被風壓擊中！"
      }
    ]
  },
  {
    "id": "dayuan_spirit",
    "name": "飛航雲鯨",
    "districtId": "dayuan",
    "role": "全體攻擊型精靈",
    "element": [
      "風",
      "機械"
    ],
    "skills": [
      {
        "id": "dayuan_spirit_01",
        "tier": "low",
        "tierName": "低階",
        "name": "雲翼衝撞",
        "energyCost": 2,
        "skillType": "single_attack",
        "target": "enemy_single",
        "description": "用雲朵機翼向前滑翔衝撞一名敵人。",
        "effect": {
          "damageMultiplier": 1.15
        },
        "battleText": "飛航雲鯨展開雲翼，衝向敵人！"
      },
      {
        "id": "dayuan_spirit_02",
        "tier": "mid",
        "tierName": "中階",
        "name": "航線光軌",
        "energyCost": 4,
        "skillType": "all_attack",
        "target": "enemy_all",
        "description": "航線光軌掃過敵方全體，造成中量傷害。",
        "effect": {
          "damageMultiplier": 1.55
        },
        "battleText": "航線光軌穿越戰場，擊中所有敵人！"
      },
      {
        "id": "dayuan_spirit_03",
        "tier": "high",
        "tierName": "高階",
        "name": "天空門戶轟鳴",
        "energyCost": 5,
        "skillType": "all_attack",
        "target": "enemy_all",
        "description": "召喚天空門戶與海風噴流，對全體敵人造成大量傷害。",
        "effect": {
          "damageMultiplier": 2.85
        },
        "battleText": "天空門戶打開，雲鯨的轟鳴席捲全場！"
      }
    ]
  },
  {
    "id": "guanyin_spirit",
    "name": "蓮光仙子",
    "districtId": "guanyin",
    "role": "治療輔助型精靈",
    "element": [
      "光",
      "水"
    ],
    "skills": [
      {
        "id": "guanyin_spirit_01",
        "tier": "low",
        "tierName": "低階",
        "name": "蓮露光珠",
        "energyCost": 2,
        "skillType": "attack_heal",
        "target": "enemy_single",
        "description": "蓮葉露珠凝成光珠攻擊一名敵人，並治癒前位夥伴。",
        "effect": {
          "damageMultiplier": 0.9,
          "healMultiplier": 0.8
        },
        "battleText": "蓮露光珠閃耀命中敵人，前位夥伴也恢復生命！"
      },
      {
        "id": "guanyin_spirit_02",
        "tier": "mid",
        "tierName": "中階",
        "name": "燈塔光盾",
        "energyCost": 3,
        "skillType": "buff_reduce_damage",
        "target": "ally_all",
        "description": "白色燈塔光化成護盾，降低全隊受到的傷害。",
        "effect": {
          "buff": "damage_taken_down",
          "value": 0.22,
          "turns": 2
        },
        "battleText": "燈塔光盾照亮隊伍，大家都更安全了！"
      },
      {
        "id": "guanyin_spirit_03",
        "tier": "high",
        "tierName": "高階",
        "name": "蓮海聖光",
        "energyCost": 6,
        "skillType": "all_heal",
        "target": "ally_all",
        "description": "蓮花、水波與燈塔光芒同時展開，大幅回復全隊生命值。",
        "effect": {
          "healMultiplier": 2
        },
        "battleText": "蓮海聖光綻放，全隊生命大量回復！"
      }
    ]
  },
  {
    "id": "xinwu_spirit",
    "name": "海稻企鵝",
    "districtId": "xinwu",
    "role": "平衡型精靈",
    "element": [
      "水",
      "土"
    ],
    "skills": [
      {
        "id": "xinwu_spirit_01",
        "tier": "low",
        "tierName": "低階",
        "name": "浪花拍擊",
        "energyCost": 2,
        "skillType": "single_attack",
        "target": "enemy_single",
        "description": "踏出浪花，拍擊一名敵人。",
        "effect": {
          "damageMultiplier": 1
        },
        "battleText": "海稻企鵝踏出浪花，拍向敵人！"
      },
      {
        "id": "xinwu_spirit_02",
        "tier": "mid",
        "tierName": "中階",
        "name": "稻穗便當",
        "energyCost": 3,
        "skillType": "single_heal",
        "target": "ally_front",
        "description": "用海風與稻穗能量補充前位夥伴的生命值。",
        "effect": {
          "healMultiplier": 1.45
        },
        "battleText": "稻穗便當帶來踏實能量，前位夥伴恢復生命！"
      },
      {
        "id": "xinwu_spirit_03",
        "tier": "high",
        "tierName": "高階",
        "name": "綠廊海風陣",
        "energyCost": 5,
        "skillType": "buff_reduce_damage",
        "target": "ally_all",
        "description": "海風與綠色走廊形成防護陣，降低全隊受到的傷害。",
        "effect": {
          "buff": "damage_taken_down",
          "value": 0.3,
          "turns": 2
        },
        "battleText": "綠廊海風陣升起，全隊受到海岸守護！"
      }
    ]
  },
  {
    "id": "zhongli_spirit",
    "name": "壢夜雷狐",
    "districtId": "zhongli",
    "role": "速度型精靈",
    "element": [
      "雷",
      "夜"
    ],
    "skills": [
      {
        "id": "zhongli_spirit_01",
        "tier": "low",
        "tierName": "低階",
        "name": "霓虹電爪",
        "energyCost": 2,
        "skillType": "single_attack",
        "target": "enemy_single",
        "description": "用霓虹電流凝成爪擊，攻擊一名敵人。",
        "effect": {
          "damageMultiplier": 1.2
        },
        "battleText": "壢夜雷狐一閃而過，霓虹電爪命中！"
      },
      {
        "id": "zhongli_spirit_02",
        "tier": "mid",
        "tierName": "中階",
        "name": "夜市加速",
        "energyCost": 3,
        "skillType": "buff_damage",
        "target": "ally_all",
        "description": "夜市燈火激勵隊伍，提升全隊攻擊傷害。",
        "effect": {
          "buff": "damage_up",
          "value": 0.22,
          "turns": 2
        },
        "battleText": "夜市加速啟動，全隊攻勢變得更俐落！"
      },
      {
        "id": "zhongli_spirit_03",
        "tier": "high",
        "tierName": "高階",
        "name": "商圈雷光網",
        "energyCost": 5,
        "skillType": "all_attack",
        "target": "enemy_all",
        "description": "霓虹雷光像街道路線般展開，攻擊全體敵人。",
        "effect": {
          "damageMultiplier": 2.6
        },
        "battleText": "商圈雷光網張開，所有敵人都被電光擊中！"
      }
    ]
  },
  {
    "id": "bade_spirit",
    "name": "埤塘焰犬",
    "districtId": "bade",
    "role": "攻防平衡型精靈",
    "element": [
      "火",
      "水"
    ],
    "skills": [
      {
        "id": "bade_spirit_01",
        "tier": "low",
        "tierName": "低階",
        "name": "水火踏步",
        "energyCost": 2,
        "skillType": "single_attack",
        "target": "enemy_single",
        "description": "踩著水火漣漪衝向敵人，造成傷害。",
        "effect": {
          "damageMultiplier": 1.1
        },
        "battleText": "埤塘焰犬踏出水火漣漪，勇敢突擊！"
      },
      {
        "id": "bade_spirit_02",
        "tier": "mid",
        "tierName": "中階",
        "name": "親水守護",
        "energyCost": 3,
        "skillType": "buff_reduce_damage",
        "target": "ally_all",
        "description": "水岸公園的守護力包圍全隊，降低受到的傷害。",
        "effect": {
          "buff": "damage_taken_down",
          "value": 0.2,
          "turns": 2
        },
        "battleText": "親水守護展開，隊伍像站在安全水岸旁！"
      },
      {
        "id": "bade_spirit_03",
        "tier": "high",
        "tierName": "高階",
        "name": "埤塘焰浪",
        "energyCost": 5,
        "skillType": "all_attack",
        "target": "enemy_all",
        "description": "火焰與水波交錯成焰浪，攻擊全體敵人。",
        "effect": {
          "damageMultiplier": 2.75
        },
        "battleText": "埤塘焰浪翻湧而起，席捲敵方全體！"
      }
    ]
  },
  {
    "id": "pingzhen_spirit",
    "name": "平原鼓熊",
    "districtId": "pingzhen",
    "role": "防禦輔助型精靈",
    "element": [
      "土",
      "音"
    ],
    "skills": [
      {
        "id": "pingzhen_spirit_01",
        "tier": "low",
        "tierName": "低階",
        "name": "鼓槌敲擊",
        "energyCost": 2,
        "skillType": "single_attack",
        "target": "enemy_single",
        "description": "用小鼓槌敲出音波，攻擊一名敵人。",
        "effect": {
          "damageMultiplier": 0.95
        },
        "battleText": "平原鼓熊敲出節奏音波，震動敵人！"
      },
      {
        "id": "pingzhen_spirit_02",
        "tier": "mid",
        "tierName": "中階",
        "name": "客庄鼓舞",
        "energyCost": 4,
        "skillType": "buff_damage",
        "target": "ally_all",
        "description": "鼓聲鼓舞所有夥伴，提升全隊攻擊傷害。",
        "effect": {
          "buff": "damage_up",
          "value": 0.25,
          "turns": 2
        },
        "battleText": "客庄鼓舞響起，全隊士氣提升！"
      },
      {
        "id": "pingzhen_spirit_03",
        "tier": "high",
        "tierName": "高階",
        "name": "水圳大地結界",
        "energyCost": 5,
        "skillType": "buff_reduce_damage",
        "target": "ally_all",
        "description": "水圳與大地音波形成結界，大幅降低全隊受到的傷害。",
        "effect": {
          "buff": "damage_taken_down",
          "value": 0.34,
          "turns": 3
        },
        "battleText": "水圳大地結界升起，隊伍被穩穩守護！"
      }
    ]
  },
  {
    "id": "yangmei_spirit",
    "name": "梅茶鹿",
    "districtId": "yangmei",
    "role": "回復輔助型精靈",
    "element": [
      "木",
      "茶"
    ],
    "skills": [
      {
        "id": "yangmei_spirit_01",
        "tier": "low",
        "tierName": "低階",
        "name": "茶香葉刃",
        "energyCost": 2,
        "skillType": "attack_heal",
        "target": "enemy_single",
        "description": "茶香光霧捲起葉刃攻擊一名敵人，並讓前位夥伴回復生命值。",
        "effect": {
          "damageMultiplier": 0.9,
          "healMultiplier": 0.8
        },
        "battleText": "茶香葉刃劃過敵人，溫暖茶霧也讓前位夥伴恢復精神！"
      },
      {
        "id": "yangmei_spirit_02",
        "tier": "mid",
        "tierName": "中階",
        "name": "梅花回復霧",
        "energyCost": 4,
        "skillType": "all_heal",
        "target": "ally_all",
        "description": "梅花與茶香霧氣擴散，回復全隊生命值。",
        "effect": {
          "healMultiplier": 1.35
        },
        "battleText": "梅花回復霧包圍全隊，大家都放鬆下來了！"
      },
      {
        "id": "yangmei_spirit_03",
        "tier": "high",
        "tierName": "高階",
        "name": "秀才茶靈祝福",
        "energyCost": 5,
        "skillType": "all_heal",
        "target": "ally_all",
        "description": "召喚茶園丘陵的祝福，大幅回復全隊生命值。",
        "effect": {
          "healMultiplier": 1.85
        },
        "battleText": "秀才茶靈祝福降下，全隊獲得溫暖治癒！"
      }
    ]
  },
  {
    "id": "longtan_spirit",
    "name": "龍泉水靈",
    "districtId": "longtan",
    "role": "魔法攻擊型精靈",
    "element": [
      "水",
      "龍"
    ],
    "skills": [
      {
        "id": "longtan_spirit_01",
        "tier": "low",
        "tierName": "低階",
        "name": "龍潭水珠",
        "energyCost": 2,
        "skillType": "single_attack",
        "target": "enemy_single",
        "description": "凝聚湖水水珠，攻擊一名敵人。",
        "effect": {
          "damageMultiplier": 1.05
        },
        "battleText": "龍潭水珠飛出，擊中敵人！"
      },
      {
        "id": "longtan_spirit_02",
        "tier": "mid",
        "tierName": "中階",
        "name": "大池龍紋",
        "energyCost": 4,
        "skillType": "single_attack",
        "target": "enemy_single",
        "description": "召喚水龍紋路纏繞敵人，造成較高傷害。",
        "effect": {
          "damageMultiplier": 1.75
        },
        "battleText": "大池龍紋亮起，水龍力量集中攻擊！"
      },
      {
        "id": "longtan_spirit_03",
        "tier": "high",
        "tierName": "高階",
        "name": "石門湖龍卷",
        "energyCost": 6,
        "skillType": "all_attack",
        "target": "enemy_all",
        "description": "湖水化為水龍旋流，對全體敵人造成大量傷害。",
        "effect": {
          "damageMultiplier": 2.85
        },
        "battleText": "石門湖龍卷席捲戰場，敵方全體受到重擊！"
      }
    ]
  },
  {
    "id": "daxi_spirit",
    "name": "木藝河狸",
    "districtId": "daxi",
    "role": "工匠型防禦精靈",
    "element": [
      "木",
      "土"
    ],
    "skills": [
      {
        "id": "daxi_spirit_01",
        "tier": "low",
        "tierName": "低階",
        "name": "木槌敲擊",
        "energyCost": 2,
        "skillType": "single_attack",
        "target": "enemy_single",
        "description": "用木工小木槌敲擊敵人，造成傷害。",
        "effect": {
          "damageMultiplier": 1.1
        },
        "battleText": "木藝河狸揮動木槌，精準敲擊！"
      },
      {
        "id": "daxi_spirit_02",
        "tier": "mid",
        "tierName": "中階",
        "name": "木窗守護",
        "energyCost": 3,
        "skillType": "buff_reduce_damage",
        "target": "ally_all",
        "description": "雕刻木窗與紅磚光紋形成守護，降低全隊受到的傷害。",
        "effect": {
          "buff": "damage_taken_down",
          "value": 0.22,
          "turns": 2
        },
        "battleText": "木窗守護立起，全隊被老街工藝保護！"
      },
      {
        "id": "daxi_spirit_03",
        "tier": "high",
        "tierName": "高階",
        "name": "大溪橋木藝陣",
        "energyCost": 5,
        "skillType": "buff_damage",
        "target": "ally_all",
        "description": "大溪橋與木藝光紋連成陣形，提升全隊攻擊傷害。",
        "effect": {
          "buff": "damage_up",
          "value": 0.3,
          "turns": 2
        },
        "battleText": "大溪橋木藝陣完成，全隊攻擊更有力！"
      }
    ]
  },
  {
    "id": "fuxing_spirit",
    "name": "山桃勇士",
    "districtId": "fuxing",
    "role": "高攻擊戰士型精靈",
    "element": [
      "木",
      "山"
    ],
    "skills": [
      {
        "id": "fuxing_spirit_01",
        "tier": "low",
        "tierName": "低階",
        "name": "桃葉斬",
        "energyCost": 2,
        "skillType": "single_attack",
        "target": "enemy_single",
        "description": "用桃葉與木矛斬擊一名敵人。",
        "effect": {
          "damageMultiplier": 1.25
        },
        "battleText": "山桃勇士揮出桃葉斬，勇敢命中敵人！"
      },
      {
        "id": "fuxing_spirit_02",
        "tier": "mid",
        "tierName": "中階",
        "name": "巨木根擊",
        "energyCost": 4,
        "skillType": "single_attack",
        "target": "enemy_single",
        "description": "召喚巨木根系集中攻擊一名敵人。",
        "effect": {
          "damageMultiplier": 1.9
        },
        "battleText": "巨木根擊從地面衝出，集中重擊！"
      },
      {
        "id": "fuxing_spirit_03",
        "tier": "high",
        "tierName": "高階",
        "name": "小烏來山瀑衝",
        "energyCost": 5,
        "skillType": "all_attack",
        "target": "enemy_all",
        "description": "高山瀑布與巨木能量同時爆發，攻擊全體敵人。",
        "effect": {
          "damageMultiplier": 3
        },
        "battleText": "小烏來山瀑衝奔流而下，敵方全體受到強力攻擊！"
      }
    ]
  }
];
