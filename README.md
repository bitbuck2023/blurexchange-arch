# 项目目的
这个项目主要是自己学习的
写了一些单元测试和后端签名的方案

# 使用
``` bash
# 部署
./deploy.sh
# 测试
./test.sh
```

## 订单签名方式
参照单元测试，不管是买单还是买单都需要预言机签名，签名的时候要修改blocknumber，填入到extraSignature里

blur把签名的rsv顺序做了修改
``` javascript
const r = signature.slice(0, 66);
const s = "0x" + signature.slice(66, 130);
const v = parseInt(signature.slice(130, 132), 16);

const abi = new ethers.utils.AbiCoder();
const rsv = abi.encode(["uint8", "bytes32", "bytes32"], [v, r, s]);
```

卖单和买单的用户签名填入到订单（order）的rsv字段里




# 项目目录
- contracts -- 合约目录
- contract_deployed -- 合约部署输出目录
- test 单元测试脚本
- backend_server 服务端，目前主要是给api或者其他端提供签名服务

## 注意事项
- 要改合约里的 WETH
- 踩了个坑，typedata的参数顺序很重要，签名要跟合约里顺序一致。
