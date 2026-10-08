const {test}=require('node:test');const assert=require('node:assert/strict');const {create,parseEther}=require('./runtime.cjs');
test('ERC-20: authorization, cap, roles and transfers',async()=>{const a=await create();try{
 const before=await a.token.totalSupply();
 await assert.rejects(a.token.connect(a.signers[1]).mint(a.addresses[1],parseEther('1')));
 await assert.rejects(a.token.mint(a.addresses[0],parseEther('1000000')));
 await a.tx('Grant',a.token.grantRole(a.role,a.addresses[1]));
 await a.tx('Mint',a.token.connect(a.signers[1]).mint(a.addresses[2],parseEther('20')));
 assert.equal(await a.token.totalSupply(),before+parseEther('20'));
 await a.tx('Revoke',a.token.revokeRole(a.role,a.addresses[1]));
 assert.equal(await a.token.hasRole(a.role,a.addresses[1]),false);
 await assert.rejects(a.token.connect(a.signers[1]).mint(a.addresses[1],parseEther('2')));
 await a.tx('Transfer',a.token.connect(a.signers[2]).transfer(a.addresses[1],parseEther('5')));
 assert.equal(await a.token.balanceOf(a.addresses[2]),parseEther('15'));
 await assert.rejects(a.token.connect(a.signers[2]).transfer(a.addresses[1],parseEther('100')));
}finally{await a.close()}});
