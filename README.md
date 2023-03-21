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

# 项目目录
- contracts -- 合约目录
- contract_deployed -- 合约部署输出目录
- test 单元测试脚本
- backend_server 服务端，目前主要是给api或者其他端提供签名服务

## 注意事项
- 要改合约里的 WETH
- 踩了个坑，typedata的参数顺序很重要，签名要跟合约里顺序一致。
