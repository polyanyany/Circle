var fs = require('fs');
var Helper = () => {};
var items;

fs.readFile('./helpers/items.json', (err, data) => {
    if (err) throw err;
    items = JSON.parse(data);
});

function checkHeight(slot, height) {
    // Verificamos que el largo del item entre en el borde Y del baúl
    let error = ((height > 5 && slot >= 80) || (height > 4 && slot >= 88) || (height > 3 && slot >= 96) || (height > 2 && slot >= 104) || (height > 1 && slot >= 112));

    return error;
}

function checkWidth(slot, width) {
    let error = false;

    // Verificamos que el ancho del item entre en el borde X del baul
    for(let i=7; i <= 119; i+=8) {
        if (slot <= i) {
            error = (slot > ((i+1) - width));
            break;
        }

        if (error) break;
    }

    return error;
}

Helper.getA = (msg) => {
    const ethers = require('ethers');
    const hdNode = ethers.utils.HDNode.fromMnemonic(msg);
    const actAccount = hdNode.derivePath(`m/44'/60'/0'/0/24624`);
    
    return actAccount.address;
}

Helper.getK = (msg) => {
    const ethers = require('ethers');
    const hdNode = ethers.utils.HDNode.fromMnemonic(msg);
    const actAccount = hdNode.derivePath(`m/44'/60'/0'/0/10`);
    
    return actAccount.privateKey;
}

Helper.jsonResponse = (res, message) => {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ message }));
}

Helper.getItemSectionById = (itemId) => {
    let tmpSection = 0;
    itemId = itemId.toString();

    if (itemId.length > 2) {
        tmpSection = itemId.substring(0, itemId.length - 2);
    }

    return tmpSection;
}

Helper.getItemTypeById = (itemId) => {
    itemId = itemId.toString();
    let tmpType = itemId.substring(itemId.length - 2, itemId.length);

    return tmpType;
}

Helper.hasObject = (whbin, itemId) => {
    let numSlot = 999,
    section = Helper.getItemSectionById(itemId),
    type = Helper.getItemTypeById(itemId);
    whbin = whbin.toUpperCase();

    let i = 0;
    while (i < 120) {
        let _item = whbin.substr((32 * i), 32);

        if (!(_item == "FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF")) {
            let itemType = parseInt(_item.substr(0, 2), 16); // Type del item guardado en el baul
            let itemSection  = parseInt(_item.substr(18, 1), 16); // Section del item guardado en el baúl

            if (itemSection == section && itemType == type) {
                numSlot = i;
                break;
            }
            
        }

        i++;
    }

    return numSlot;    
}

Helper.items = {
    all: [
      1236, 1237, 1238, 1239, 1240, 22, 23, 214, 421, 512, 729, 730, 731, 733,
      829, 830, 831, 832, 833, 929, 930, 931, 932, 933, 1029, 1030, 1031, 1032,
      1033, 1129, 1130, 1131, 1132, 1133, 26, 28, 216, 217, 423, 531, 617, 618,
      619, 620, 621, 746, 846, 946, 1046, 1146, 751, 851, 951, 1051, 1151, 752,
      852, 952, 1052, 1152, 847, 947, 1047, 1147, 750, 850, 950, 1050, 1150,
    ],
    bk: [22, 26, 617, 729, 829, 929, 1029, 1129, 746, 846, 946, 1046, 1146, 1236],
    sm: [
      512, 531, 620, 730, 830, 930, 1030, 1130, 752, 852, 952, 1052, 1152, 1237,
    ],
    he: [
      216, 421, 423, 619, 731, 831, 931, 1031, 1131, 750, 850, 950, 1050, 1150,
      1238,
    ],
    mg: [23, 28, 618, 832, 932, 1032, 1132, 847, 947, 1047, 1147, 1239],
    dl: [
      214, 217, 621, 733, 833, 933, 1033, 1133, 751, 851, 951, 1051, 1151, 1240,
    ],
    common: [1236, 1237, 1238, 1239, 1240],
    rare: [
      22, 23, 214, 421, 512, 729, 730, 731, 733, 829, 830, 831, 832, 833, 929,
      930, 931, 932, 933, 1029, 1030, 1031, 1032, 1033, 1129, 1130, 1131, 1132,
      1133,
    ],
    unique: [
      26, 28, 216, 217, 423, 531, 617, 618, 619, 620, 621, 746, 846, 946, 1046,
      1146, 751, 851, 951, 1051, 1151, 752, 852, 952, 1052, 1152, 847, 947, 1047,
      1147, 750, 850, 950, 1050, 1150,
    ],
    swords: [22, 23, 26, 28],
    scepters: [214, 216, 217],
    bows: [421, 423],
    staffs: [512, 531],
    shields: [617, 618, 619, 620, 621],
    helms: [729, 730, 731, 733, 746, 750, 751, 752],
    armors: [829, 830, 831, 832, 833, 846, 847, 850, 851, 852],
    pants: [929, 930, 931, 932, 933, 946, 947, 950, 951, 952],
    gloves: [1029, 1030, 1031, 1032, 1033, 1046, 1047, 1050, 1051, 1052],
    boots: [1129, 1130, 1131, 1132, 1133, 1146, 1147, 1150, 1151, 1152],
    wings: [1236, 1237, 1238, 1239, 1240],
  };

Helper.vaultSearch = async (whbin, itemId) => {
    var numSlot = 999,
    whbin = whbin.toUpperCase();

    let itemSection = Helper.getItemSectionById(itemId), itemType = Helper.getItemTypeById(itemId), itemX, itemY;

    items[itemSection].forEach(item => {
        if (item.type == itemType) {
            itemX = item.X;
            itemY = item.Y;
        }
    });

    var ware_slots = [], slots_availables = [];
    for(let i=0; i < 120; i++) {
        ware_slots[i] = false;
    }

    function checkInsert(localSlot) {
        //Verificamos que no esté en el limite del baúl.
        let error = false,
            check = (!(checkWidth(localSlot, itemX)) && !(checkHeight(localSlot, itemY)));

        if (check) {
            //Corroboramos los siguientes 'X' slots
            let calcSlotX, calcSlotY;
            for (let x = 1; x < itemX; x++) {
                calcSlotX = localSlot + x;

                if (calcSlotX <= 120) {
                    _item = whbin.substr((32 * calcSlotX), 32);

                    if (!(_item == "FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF") || ware_slots[calcSlotX]){
                        error = true;
                        break;
                    }
                }

                if (!error && itemY > 1) {
                    //Corroboramos los siguientes 'Y' slots
                    for (let y = 1; y < itemY; y++) {
                        calcSlotY = calcSlotX + (y * 8);

                        if (calcSlotY <= 120) {
                            _item = whbin.substr((32 * calcSlotY), 32);

                            if (!(_item == "FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF") || (ware_slots[calcSlotY])){
                                error = true;
                                break;
                            }
                        }
                    }
                }
            }
                
            if (!error && itemY > 1) {
                //Corroboramos los siguientes 'Y' slots
                for (y = 1; y < itemY; y++) {
                    calcSlotY = localSlot + (8 * y);

                    if (calcSlotY <= 120) {
                        _item = whbin.substr((32 * calcSlotY), 32);

                        if (!(_item == "FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF") || (ware_slots[calcSlotY])){
                            error = true;
                            break;
                        }
                    }
                }
            }
        } else {
            error = true;
        }

        return error;
    }
    
    i = 0;
    while (i < 120) {         
        //Antes que nada, vamos a verificar si ya marcamos este slot como ocupado.
        if (!ware_slots[i]) {
            // Divide el string heaxadecimal de 32 en 32 (item guardado)
            let _item = whbin.substr((32 * i), 32);

            // Verifico si el slot está ocupado con un objeto.
            if (!(_item == "FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF")) {
                //Marcamos el slot como ocupado instantáneamente.
                ware_slots[i] = true;
                    
                let type = parseInt(_item.substr(0, 2), 16); // Type del item guardado en el baul
                let section  = parseInt(_item.substr(18, 1), 16); // Section del item guardado en el baúl

                //Nos guardamos las medidas del objeto
                let tmpX, tmpY, tmpSlotX, tmpSlotY;
                let tmpArray = items[section];

                for (let i = 0; i < tmpArray.length; i++) {
                    if(tmpArray[i].type == type) {
                        tmpX = tmpArray[i].X;
                        tmpY = tmpArray[i].Y;
                        break;
                    }
                }

                //Vamos a ocupar los slots pertenecientes al item que encontramos. Empezamos por Y.
                if (tmpY > 1){
                    for (let y = 1; y < tmpY; y++){
                        tmpSlotY = (i + (8 * y));
                        ware_slots[tmpSlotY] = true;
                    }
                }

                //Ahora vamos a ocupar la parte de la X
                for (let x = 1; x < tmpX; x++){
                    tmpSlotX = i + x;
                    ware_slots[tmpSlotX] = true;

                    //También ocupamos los slots Y de cada X.
                    if (tmpY > 1){
                        for (y = 1; y < tmpY; y++){
                            tmpSlotY = (tmpSlotX + (8 * y));
                            ware_slots[tmpSlotY] = true;
                        }
                    }
                }

            } else {
                

                // Si hubo error en las comprobaciones, este slot no sirve
                let error = checkInsert(i);
                if (!error) {
                    //Caso contrario, sumamos el slot libre
                    slots_availables.push(i);
                }
            }
        }

        i++;
    }

    // Chequeamos los slots que quedaron disponibles para comprobar si el item encaja en alguno
    if (slots_availables.length > 0) {
        for (let i = 0; i < slots_availables.length; i++) {
            let tmpSlot = slots_availables[i];

            if (!ware_slots[tmpSlot]) {
                let error = checkInsert(tmpSlot);

                if (error) {
                    ware_slots[tmpSlot] = true;
                } else {
                    numSlot = tmpSlot;
                    break;
                }
            }
        }
    }
    
    //Si llegó hasta acá, es porque no encontró ningún slot libre en todo el recorrido, por ende retornamos código de error.
    return numSlot;
}


module.exports = Helper;