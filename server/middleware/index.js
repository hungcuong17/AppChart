
const multer = require('multer');
const fs = require('fs');
const CryptoJS = require("crypto-js");
/**
 * Middleware check và lấy dữ liệu về file mà client người đến
 * @arrData : mảng các đối tượng chứa name - tên của thuộc tính lưu dữ liệu file
 * trong data mà client gửi lên, path - đường dẫn đến thư mục muốn lưu file
 * @type: kiểu upload file (single, array, fields)
 */
exports.uploadFile = (arrData, type) => {
    var name, arrFile;
    // Tạo folder chứa file khi chưa có folder
    arrData.forEach(x => {
        let dir = `./upload${x.path}`;
        if (!fs.existsSync(dir)){
                fs.mkdirSync(dir);
            }
    })

    const getFile = multer({ storage: multer.diskStorage({
            destination: (req, file, cb) => {
                if(type === 'single' || type === 'array'){
                    cb(null, `./upload${arrData[0].path}`);
                } else if(type === 'fields'){
                    for(let n in arrData){
                        if(file.fieldname === arrData[n].name){
                            cb(null, `./upload${arrData[n].path}`);
                            break;
                        }
                    }
                }
            },
            filename: function (req, file, cb) {
                let  extend = file.originalname.split('.');
                let oldNameFile = extend.splice(0, extend.length-1);
                    oldNameFile = oldNameFile.join('.');
                let hash =`${Date.now()}_`+ CryptoJS.MD5(oldNameFile).toString();
                cb(null, `${hash}.${extend[extend.length-1]}`);
            }
        }),
    });
    
    switch (type) {
        case 'single':
            name = arrData[0].name;
            return getFile.single(name);
        case 'array':
            name = arrData[0].name;
            return getFile.array(name, 20);
        case 'fields':
            arrFile = arrData.map(x=>{
                return {name: x.name, maxCount:20}
            })
            return getFile.fields(arrFile);
        default:
            break;
    }
}