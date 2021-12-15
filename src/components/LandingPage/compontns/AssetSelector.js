import {useERC20Balance} from "./useERC20Balance";
import {useMoralis, useNativeBalance} from "react-moralis";
import {useMemo} from "react";

export default function AssetSelector({setAsset, style}) {
  const {assets} = useERC20Balance();
  const {data: nativeBalance, nativeToken} = useNativeBalance();
  const {Moralis} = useMoralis();

  const fullBalance = useMemo(() => {
    if (!assets || !nativeBalance) return null;
    console.log(assets, nativeBalance);
    return [
      ...assets,
      {
        balance: nativeBalance.balance,
        decimals: nativeToken.decimals,
        name: nativeToken.name,
        symbol: nativeToken.symbol,
        token_address: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
      },
    ];
  }, [assets, nativeBalance, nativeToken]);

  function handleChange(value) {
    const token = fullBalance.find((token) => token.token_address === value);
    setAsset(token);
  }

  return (
    <select
      onChange={handleChange}
      size="large"
      className="rounded border appearance-none border-gray-300 py-2 focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-500 text-base pl-3 pr-10"
      style={style}
    >
      {fullBalance &&
        fullBalance.map((item, key) => (
          <option value={item["token_address"]} key={item["token_address"]}>
            {item.symbol} (
            {parseFloat(
              Moralis.Units.FromWei(item.balance, item.decimals).toFixed(6)
            )}
            )
            {/* <div
              style={{
                display: "flex",
                alignItems: "center",
                width: "100%",
                gap: "8px",
              }}
            >
              <Image
                src={
                  item.logo ||
                  "https://etherscan.io/images/main/empty-token.png"
                }
                alt="nologo"
                width="24px"
                height="24px"
                preview={false}
                style={{borderRadius: "15px"}}
              />
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  width: "90%",
                }}
              >
                <p>{item.symbol}</p>
                <p style={{alignSelf: "right"}}>
                  (
                  {parseFloat(
                    Moralis.Units.FromWei(item.balance, item.decimals).toFixed(
                      6
                    )
                  )}
                  )
                </p>
              </div>
            </div> */}
          </option>
        ))}
    </select>
  );
}
