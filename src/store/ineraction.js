import { ethers } from "ethers";
import TOKEN_ABI from '../abi/Token.json'
import EXCHANGE_ABI from '../abi/Exchange.json'

export const loadProvider = (dispatch)=>{
    const connection = new ethers.providers.Web3Provider(window.ethereum);
    dispatch({type:'PROVIDER_LOADED', connection});

    return connection;
}

export const loadNetwork = async(dispatch,provider)=>{
    const network = await provider.getNetwork();
    console.log(network.chainId)
    dispatch({type:'NETWORK_LOADED' , chainId : network.chainId});

    return network.chainId;
}

export const loadAccount = async(dispatch , provider)=>{
    const accounts = await window.ethereum.request({method:'eth_requestAccounts'});
    dispatch({type:'ACCOUNT_LOADED' , account : accounts[0]});
   
    const balance = await provider.getBalance(accounts[0]);
    const amount = await ethers.utils.formatEther(balance.toString());
    dispatch({type:'ETHERS_LOADED' , amount});

    return amount;
}

export const loadTokens = async(addresses,dispatch,provider)=>{
    let token,symbol;
    token= new ethers.Contract( addresses[0],TOKEN_ABI,provider);
    symbol = await token.symbol();
    dispatch({type:'TOKEN_1_LOADED' , token , symbol});

    token= new ethers.Contract( addresses[1],TOKEN_ABI,provider);
    symbol = await token.symbol();
    dispatch({type:'TOKEN_2_LOADED' , token , symbol});  
}

export const loadExchange = async(address,dispatch,provider)=>{
    let exchange;
    exchange= new ethers.Contract( address,EXCHANGE_ABI,provider);
    
    dispatch({type:'EXCHANGE_LOADED', exchange});

    return exchange;
}

export const loadBalance = async(dispatch,tokens,account,exchange)=>{
    let balance;
    balance = ethers.utils.formatUnits(await tokens[0].balanceOf(account),18);
    dispatch({type:'TOKEN_1_BALANCE_LOADED',balance})

    balance = ethers.utils.formatUnits(await exchange.balanceOf(tokens[0].address,account),18);
    dispatch({type:'TOKEN_1_EXCHANGE_BALANCE_LOADED',balance})

    balance = ethers.utils.formatUnits(await tokens[1].balanceOf(account),18);
    dispatch({type:'TOKEN_2_BALANCE_LOADED',balance})

    balance = ethers.utils.formatUnits(await exchange.balanceOf(tokens[1].address,account),18);
    dispatch({type:'TOKEN_2_EXCHANGE_BALANCE_LOADED',balance})
}

export const subscribeToEvent = async(exchange,dispatch)=>{
  exchange.on('Deposit',(_token,_user,_amount,_balance,event)=>{
    dispatch({type:'TRANSFER_SUCCESSFUL',event});
  })
}

// TRANFER (DEPOSIT AND WITHDRAW)

export const TransferToken = async(provider,exchange,transferAmount,token,dispatch)=>{

    dispatch({type:'TRANSFER_PENDING'});
    let Transaction;
   
    try {
    const signer = await provider.getSigner();
    const amount = ethers.utils.parseUnits(transferAmount.toString(),18);
    Transaction = await token.connect(signer).approve(exchange.address,amount);
    await Transaction.wait();
 
   //deposit
    Transaction = await exchange.connect(signer).depositToken(token.address,amount);
    await Transaction.wait(); 
    } catch (error) {
        dispatch({type:'TRANSACTION_FAIL'})
    }
   
 
} 
