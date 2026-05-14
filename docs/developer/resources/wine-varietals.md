# Wine Varietals

**Source:** [https://developer.commerce7.com/docs/wine-varietals](https://developer.commerce7.com/docs/wine-varietals)

**Section:** resources

---
Varietals are a property available on wine products. Commerce7 has a specific list of varietals to the most widely used varietals and those officially approved.
Below is a sample response, but we are continually adding new varietals to the system. Please check to see if your varietal exists in Commerce7's standard list. If it doesn't, reach out to [[email protected]](/cdn-cgi/l/email-protection#aedddbdedec1dcdaeecdc1c3c3cbdccdcb9980cdc1c3).
* * *
# 
List varietals
**`GET`** `/wine-varietal`
**Response**  
An array of `wineVarietals` and total count
JSON
    
    {
        "wineVarietals": [
            {
                "id": "5049f63a-5e2e-48d8-97ac-77e0ecffe6d3",
                "type": "Champagne",
                "varietal": "Arbane",
                "createdAt": "2019-03-29T06:57:16.000Z",
                "updatedAt": "2019-03-29T06:57:16.000Z"
            },
            {
                "id": "f46eb1ef-65f0-48d1-a916-039bab1e388c",
                "type": "Champagne",
                "varietal": "Chardonnay",
                "createdAt": "2019-03-29T06:57:16.000Z",
                "updatedAt": "2019-03-29T06:57:16.000Z"
            },
            {
                "id": "5c2cd1a5-c5a9-42e4-ae1a-975691ee64ad",
                "type": "Champagne",
                "varietal": "Meunier",
                "createdAt": "2019-03-29T06:57:16.000Z",
                "updatedAt": "2019-03-29T06:57:16.000Z"
            },
            {
                "id": "b4f8a9b2-83bb-4b27-b4e2-c8f0e6b15d63",
                "type": "Champagne",
                "varietal": "Petit Meslier",
                "createdAt": "2019-03-29T06:57:16.000Z",
                "updatedAt": "2019-03-29T06:57:16.000Z"
            },
            {
                "id": "6aeb2d25-665c-49fe-aadb-56ef217e59c4",
                "type": "Champagne",
                "varietal": "Pinot Blanc",
                "createdAt": "2019-03-29T06:57:16.000Z",
                "updatedAt": "2019-03-29T06:57:16.000Z"
            },
            {
                "id": "1bfe44d4-b83d-40a2-8465-236a24878610",
                "type": "Champagne",
                "varietal": "Pinot Gris",
                "createdAt": "2019-03-29T06:57:16.000Z",
                "updatedAt": "2019-03-29T06:57:16.000Z"
            },
            {
                "id": "c1bd04c3-d896-48d1-ac72-9e1cf1ec3137",
                "type": "Champagne",
                "varietal": "Pinot Noir",
                "createdAt": "2019-03-29T06:57:16.000Z",
                "updatedAt": "2019-03-29T06:57:16.000Z"
            },
            {
                "id": "62d32dce-4eff-4978-88be-749f389922c4",
                "type": "Dessert",
                "varietal": "Moscato",
                "createdAt": "2018-03-05T03:04:58.000Z",
                "updatedAt": "2018-03-05T03:04:58.000Z"
            },
            {
                "id": "6c5e37b7-881a-481c-b863-8ab77a90ce95",
                "type": "Dessert",
                "varietal": "Other",
                "createdAt": "2018-03-05T03:04:58.000Z",
                "updatedAt": "2018-03-05T03:04:58.000Z"
            },
            {
                "id": "f005a04a-d23b-493d-bbe0-a963b1d26f67",
                "type": "Dessert",
                "varietal": "Port",
                "createdAt": "2018-11-16T15:53:42.000Z",
                "updatedAt": "2018-11-16T15:53:42.000Z"
            },
            {
                "id": "63333497-8b6c-47fa-9eed-5f04d54fda0f",
                "type": "Dessert",
                "varietal": "Riesling",
                "createdAt": "2018-11-16T15:53:42.000Z",
                "updatedAt": "2018-11-16T15:53:42.000Z"
            },
            {
                "id": "4279cc08-dd9b-4ab5-a91d-55f7fc16c370",
                "type": "Ice",
                "varietal": "Riesling",
                "createdAt": "2018-02-22T23:54:26.000Z",
                "updatedAt": "2018-02-22T23:54:26.000Z"
            },
            {
                "id": "ac70022a-e22d-4c8c-a1f7-ca6f78259f5e",
                "type": "Red",
                "varietal": "Barbera",
                "createdAt": "2018-03-05T03:04:58.000Z",
                "updatedAt": "2018-03-05T03:04:58.000Z"
            },
            {
                "id": "07411b80-d9b3-45f0-a7bf-ea3784cc1bb7",
                "type": "Red",
                "varietal": "Blaufrankisch",
                "createdAt": "2018-03-05T03:04:58.000Z",
                "updatedAt": "2018-03-05T03:04:58.000Z"
            },
            {
                "id": "34bf475a-a828-4b9b-92ac-a5513e20bbbd",
                "type": "Red",
                "varietal": "Blend",
                "createdAt": "2018-02-22T23:54:26.000Z",
                "updatedAt": "2018-02-22T23:54:26.000Z"
            },
            {
                "id": "651f2d02-4be5-447e-b4b0-17ab28b623da",
                "type": "Red",
                "varietal": "Bordeaux Blend",
                "createdAt": "2018-03-05T03:04:58.000Z",
                "updatedAt": "2018-03-05T03:04:58.000Z"
            },
            {
                "id": "995874ae-b2af-4e05-b6a9-b1c83dd2f348",
                "type": "Red",
                "varietal": "Cabernet",
                "createdAt": "2018-02-22T23:54:26.000Z",
                "updatedAt": "2018-02-22T23:54:26.000Z"
            },
            {
                "id": "f7b441b2-fb71-4b72-adad-6753fc0b0472",
                "type": "Red",
                "varietal": "Cabernet Franc",
                "createdAt": "2018-03-05T03:04:58.000Z",
                "updatedAt": "2018-03-05T03:04:58.000Z"
            },
            {
                "id": "ae7e1150-7255-49a2-b598-b0bd480b6946",
                "type": "Red",
                "varietal": "Cabernet Sauvignon",
                "createdAt": "2018-03-05T03:04:58.000Z",
                "updatedAt": "2018-03-05T03:04:58.000Z"
            },
            {
                "id": "c1f447aa-ca19-4019-9a68-1bdc7bc2472e",
                "type": "Red",
                "varietal": "Carignan",
                "createdAt": "2019-04-15T02:48:27.000Z",
                "updatedAt": "2019-04-15T02:48:27.000Z"
            },
            {
                "id": "0a65247a-6986-447f-bef0-e873fdc2e781",
                "type": "Red",
                "varietal": "Carignane",
                "createdAt": "2018-03-05T03:04:58.000Z",
                "updatedAt": "2018-03-05T03:04:58.000Z"
            },
            {
                "id": "371cb2a5-50fb-472e-92a7-07c834766b32",
                "type": "Red",
                "varietal": "Cinsaut",
                "createdAt": "2019-04-15T02:48:27.000Z",
                "updatedAt": "2019-04-15T02:48:27.000Z"
            },
            {
                "id": "15695834-2bdc-4e58-9572-220e5dd6cb82",
                "type": "Red",
                "varietal": "Gamay Noir",
                "createdAt": "2019-04-15T02:48:27.000Z",
                "updatedAt": "2019-04-15T02:48:27.000Z"
            },
            {
                "id": "3286fa29-3208-405b-8944-de8216948b85",
                "type": "Red",
                "varietal": "Grenache",
                "createdAt": "2018-03-05T03:04:58.000Z",
                "updatedAt": "2018-03-05T03:04:58.000Z"
            },
            {
                "id": "7e0e47cf-b9b7-4196-be5a-47d6c102f17b",
                "type": "Red",
                "varietal": "Malbec",
                "createdAt": "2018-03-05T03:04:58.000Z",
                "updatedAt": "2018-03-05T03:04:58.000Z"
            },
            {
                "id": "a8a797cf-0008-491f-a248-b6d2cca02f33",
                "type": "Red",
                "varietal": "Meritage",
                "createdAt": "2018-03-05T03:04:58.000Z",
                "updatedAt": "2018-03-05T03:04:58.000Z"
            },
            {
                "id": "5a6e8b54-424b-4ca3-be10-720a81e179fe",
                "type": "Red",
                "varietal": "Merlot",
                "createdAt": "2018-02-22T23:54:26.000Z",
                "updatedAt": "2018-02-22T23:54:26.000Z"
            },
            {
                "id": "a824b624-d707-4882-a080-6e67dfafa4f8",
                "type": "Red",
                "varietal": "Mourvèdre",
                "createdAt": "2019-04-15T02:48:27.000Z",
                "updatedAt": "2019-04-15T02:48:27.000Z"
            },
            {
                "id": "7533f115-e29f-490c-b8bb-76226988950a",
                "type": "Red",
                "varietal": "Muscadel",
                "createdAt": "2019-04-15T02:48:27.000Z",
                "updatedAt": "2019-04-15T02:48:27.000Z"
            },
            {
                "id": "66e8fdfa-0b5d-4797-8a22-674fdd6fec9f",
                "type": "Red",
                "varietal": "Nebbiolo",
                "createdAt": "2019-04-15T02:48:27.000Z",
                "updatedAt": "2019-04-15T02:48:27.000Z"
            },
            {
                "id": "45a01d1f-deb5-447b-b470-32652199074a",
                "type": "Red",
                "varietal": "Other",
                "createdAt": "2018-03-05T03:04:58.000Z",
                "updatedAt": "2018-03-05T03:04:58.000Z"
            },
            {
                "id": "6d0b1b84-4691-4f84-a6cc-09ce9417fb6e",
                "type": "Red",
                "varietal": "Petit Verdot",
                "createdAt": "2018-03-05T03:04:58.000Z",
                "updatedAt": "2018-03-05T03:04:58.000Z"
            },
            {
                "id": "5fb6c780-1d1c-4770-9312-5e76a5f62676",
                "type": "Red",
                "varietal": "Petite Sirah",
                "createdAt": "2018-03-05T03:04:58.000Z",
                "updatedAt": "2018-03-05T03:04:58.000Z"
            },
            {
                "id": "4f21ee91-e1b0-4a75-9cbe-5eb86505b9f2",
                "type": "Red",
                "varietal": "Pinot Noir",
                "createdAt": "2018-03-05T03:04:58.000Z",
                "updatedAt": "2018-03-05T03:04:58.000Z"
            },
            {
                "id": "70976653-ea5b-4a4b-b2d1-89b3d1b32a8e",
                "type": "Red",
                "varietal": "Pinotage",
                "createdAt": "2018-09-07T21:11:27.000Z",
                "updatedAt": "2018-09-07T21:11:27.000Z"
            },
            {
                "id": "8a295ba2-cbb3-4b13-9356-94c9d2c8a2c4",
                "type": "Red",
                "varietal": "Roobernet",
                "createdAt": "2019-04-15T02:48:27.000Z",
                "updatedAt": "2019-04-15T02:48:27.000Z"
            },
            {
                "id": "5d2a5648-3038-496b-bb8e-fdb6826ad752",
                "type": "Red",
                "varietal": "Ruby Cabernet",
                "createdAt": "2019-04-15T02:48:27.000Z",
                "updatedAt": "2019-04-15T02:48:27.000Z"
            },
            {
                "id": "a77df809-52df-454b-8eed-eade9f87dc7b",
                "type": "Red",
                "varietal": "Sangiovese",
                "createdAt": "2018-06-06T20:07:21.000Z",
                "updatedAt": "2018-06-06T20:07:21.000Z"
            },
            {
                "id": "55f143e2-23f4-4110-940a-844bee0f9bad",
                "type": "Red",
                "varietal": "Shiraz",
                "createdAt": "2018-03-05T03:04:58.000Z",
                "updatedAt": "2018-03-05T03:04:58.000Z"
            },
            {
                "id": "fd1fbcb1-ab0b-4a79-b856-f11e5bff3431",
                "type": "Red",
                "varietal": "Souzào",
                "createdAt": "2019-04-15T02:48:27.000Z",
                "updatedAt": "2019-04-15T02:48:27.000Z"
            },
            {
                "id": "e7143f33-bad6-438c-9d0b-52e713af204e",
                "type": "Red",
                "varietal": "Syrah",
                "createdAt": "2018-03-05T03:04:58.000Z",
                "updatedAt": "2018-03-05T03:04:58.000Z"
            },
            {
                "id": "67555bcd-9dab-49ce-b023-7bc083cc44d0",
                "type": "Red",
                "varietal": "Tempranillo",
                "createdAt": "2018-03-05T03:04:58.000Z",
                "updatedAt": "2018-03-05T03:04:58.000Z"
            },
            {
                "id": "478ab22e-6730-47c1-872a-5d9401849daa",
                "type": "Red",
                "varietal": "Tinta Barocca",
                "createdAt": "2019-04-15T02:48:27.000Z",
                "updatedAt": "2019-04-15T02:48:27.000Z"
            },
            {
                "id": "6006fc09-2a45-47aa-81fa-892765cc7896",
                "type": "Red",
                "varietal": "Touriga Nacional",
                "createdAt": "2019-04-15T02:48:27.000Z",
                "updatedAt": "2019-04-15T02:48:27.000Z"
            },
            {
                "id": "6d3f8f5a-3652-47cd-b5fb-535c62a4d1f5",
                "type": "Red",
                "varietal": "Zinfandel",
                "createdAt": "2018-03-05T03:04:58.000Z",
                "updatedAt": "2018-03-05T03:04:58.000Z"
            },
            {
                "id": "e48995a1-b862-48bf-a42b-38843e55ce2e",
                "type": "Rose",
                "varietal": "Rosato",
                "createdAt": "2018-03-05T03:04:58.000Z",
                "updatedAt": "2018-03-05T03:04:58.000Z"
            },
            {
                "id": "c3f8b3a6-a9e1-4519-8990-ba4b1467374f",
                "type": "Rose",
                "varietal": "Rose",
                "createdAt": "2018-03-05T03:04:58.000Z",
                "updatedAt": "2018-03-05T03:04:58.000Z"
            },
            {
                "id": "e5ee5d53-5096-4714-8ac4-1e896f3db1ec",
                "type": "Sparkling",
                "varietal": "Sparkling",
                "createdAt": "2018-06-06T20:07:21.000Z",
                "updatedAt": "2018-06-06T20:07:21.000Z"
            },
            {
                "id": "843001e7-8ec0-4875-96bc-b7989b3ced2f",
                "type": "White",
                "varietal": "Blend",
                "createdAt": "2018-02-22T23:54:26.000Z",
                "updatedAt": "2018-02-22T23:54:26.000Z"
            },
            {
                "id": "353b0f42-90fa-4715-a899-f228e555bd71",
                "type": "White",
                "varietal": "Bukettraube",
                "createdAt": "2019-04-15T02:48:27.000Z",
                "updatedAt": "2019-04-15T02:48:27.000Z"
            },
            {
                "id": "b2e52b12-1802-4037-8514-1b65ca2da87c",
                "type": "White",
                "varietal": "Chardonnay",
                "createdAt": "2018-02-22T23:54:26.000Z",
                "updatedAt": "2018-02-22T23:54:26.000Z"
            },
            {
                "id": "d0a13bbd-6a33-4c31-b3de-fec9f7577bca",
                "type": "White",
                "varietal": "Chenel",
                "createdAt": "2019-04-15T02:48:27.000Z",
                "updatedAt": "2019-04-15T02:48:27.000Z"
            },
            {
                "id": "c7229308-7c7d-4c32-9309-526fd6086f92",
                "type": "White",
                "varietal": "Chenin Blanc",
                "createdAt": "2019-04-15T02:48:27.000Z",
                "updatedAt": "2019-04-15T02:48:27.000Z"
            },
            {
                "id": "87cd9081-d0ff-4022-8b25-37256ceee12a",
                "type": "White",
                "varietal": "Clairette Blanche",
                "createdAt": "2019-04-15T02:48:27.000Z",
                "updatedAt": "2019-04-15T02:48:27.000Z"
            },
            {
                "id": "54637820-3542-4623-99d8-c02dc68c6026",
                "type": "White",
                "varietal": "Colombar",
                "createdAt": "2019-04-15T02:48:27.000Z",
                "updatedAt": "2019-04-15T02:48:27.000Z"
            },
            {
                "id": "77ee7d30-bf85-4283-bcd4-fe52f5c20ac5",
                "type": "White",
                "varietal": "Crouchen Blanc",
                "createdAt": "2019-04-15T02:48:27.000Z",
                "updatedAt": "2019-04-15T02:48:27.000Z"
            },
            {
                "id": "00f4ab4c-71cd-428a-894d-0997902cfe8b",
                "type": "White",
                "varietal": "Emerald Riesling",
                "createdAt": "2019-04-15T02:48:27.000Z",
                "updatedAt": "2019-04-15T02:48:27.000Z"
            },
            {
                "id": "21aea7b4-dcc0-43d9-9b4a-0019ec96398f",
                "type": "White",
                "varietal": "Fume Blanc",
                "createdAt": "2018-03-05T03:04:58.000Z",
                "updatedAt": "2018-03-05T03:04:58.000Z"
            },
            {
                "id": "90eca79f-7ae8-4428-8633-17463341f678",
                "type": "White",
                "varietal": "Gewurztraminer",
                "createdAt": "2018-03-05T03:04:58.000Z",
                "updatedAt": "2018-03-05T03:04:58.000Z"
            },
            {
                "id": "596f71d6-9794-45f3-9c89-76c63f8b45cc",
                "type": "White",
                "varietal": "Grenache Blanc",
                "createdAt": "2018-03-05T03:04:58.000Z",
                "updatedAt": "2018-03-05T03:04:58.000Z"
            },
            {
                "id": "c33c3b78-c5b8-496d-b2bc-f83936310952",
                "type": "White",
                "varietal": "Malvasia Bianca",
                "createdAt": "2018-03-05T03:04:58.000Z",
                "updatedAt": "2018-03-05T03:04:58.000Z"
            },
            {
                "id": "24525e08-7b05-4a68-a9db-7158033e2250",
                "type": "White",
                "varietal": "Marsanne",
                "createdAt": "2019-04-15T02:48:27.000Z",
                "updatedAt": "2019-04-15T02:48:27.000Z"
            },
            {
                "id": "a07dc53e-5e62-4012-a56e-27438861a592",
                "type": "White",
                "varietal": "Muscadel",
                "createdAt": "2019-04-15T02:48:27.000Z",
                "updatedAt": "2019-04-15T02:48:27.000Z"
            },
            {
                "id": "9a452dcf-fb45-4807-865c-265425e68dd5",
                "type": "White",
                "varietal": "Muscat",
                "createdAt": "2018-03-05T03:04:58.000Z",
                "updatedAt": "2018-03-05T03:04:58.000Z"
            },
            {
                "id": "1ab37ca8-69d8-406b-854b-1100c2310325",
                "type": "White",
                "varietal": "Muscat d'Alexandrie",
                "createdAt": "2019-04-15T02:48:27.000Z",
                "updatedAt": "2019-04-15T02:48:27.000Z"
            },
            {
                "id": "c248cb24-45d8-4bbe-a91f-aa03552977cb",
                "type": "White",
                "varietal": "Nouvelle",
                "createdAt": "2019-04-15T02:48:27.000Z",
                "updatedAt": "2019-04-15T02:48:27.000Z"
            },
            {
                "id": "e141c868-d325-4262-b96e-18088a51319e",
                "type": "White",
                "varietal": "Other",
                "createdAt": "2018-03-05T03:04:58.000Z",
                "updatedAt": "2018-03-05T03:04:58.000Z"
            },
            {
                "id": "f28e69bb-9f31-4210-914c-24c353717059",
                "type": "White",
                "varietal": "Palomino",
                "createdAt": "2019-04-15T02:48:27.000Z",
                "updatedAt": "2019-04-15T02:48:27.000Z"
            },
            {
                "id": "3cef971d-de85-461f-8616-4d3feaa8da64",
                "type": "White",
                "varietal": "Pinot Blanc",
                "createdAt": "2018-12-07T16:23:18.000Z",
                "updatedAt": "2018-12-07T16:23:18.000Z"
            },
            {
                "id": "f2a7ab68-2eee-4929-8c82-e4e0ba86c49e",
                "type": "White",
                "varietal": "Pinot Grigio",
                "createdAt": "2018-03-05T03:04:58.000Z",
                "updatedAt": "2018-03-05T03:04:58.000Z"
            },
            {
                "id": "a8dfeab0-1f5f-4aae-8806-7d4a2135520f",
                "type": "White",
                "varietal": "Pinot Gris",
                "createdAt": "2018-03-05T03:04:58.000Z",
                "updatedAt": "2018-03-05T03:04:58.000Z"
            },
            {
                "id": "c41af6cd-aa84-49a1-b6cb-ed16401eb78e",
                "type": "White",
                "varietal": "Riesling",
                "createdAt": "2018-02-22T23:54:26.000Z",
                "updatedAt": "2018-02-22T23:54:26.000Z"
            },
            {
                "id": "b2a459f8-ab5c-4cfd-999c-af01802af676",
                "type": "White",
                "varietal": "Roussanne",
                "createdAt": "2019-04-15T02:48:27.000Z",
                "updatedAt": "2019-04-15T02:48:27.000Z"
            },
            {
                "id": "b2ec93cd-b7c4-4881-aa1b-a2d2fee5d8e5",
                "type": "White",
                "varietal": "Sauvignon Blanc",
                "createdAt": "2018-03-05T03:04:58.000Z",
                "updatedAt": "2018-03-05T03:04:58.000Z"
            },
            {
                "id": "edc473b0-5167-4d29-9cd2-0e054b09fdd9",
                "type": "White",
                "varietal": "Semillon",
                "createdAt": "2019-04-15T02:48:27.000Z",
                "updatedAt": "2019-04-15T02:48:27.000Z"
            },
            {
                "id": "c9e93113-f59f-43db-83bf-bf879cf7ae5a",
                "type": "White",
                "varietal": "Ugni Blanc",
                "createdAt": "2019-04-15T02:48:27.000Z",
                "updatedAt": "2019-04-15T02:48:27.000Z"
            },
            {
                "id": "4236ae14-ab10-4146-9c48-4ff15f2fa0bd",
                "type": "White",
                "varietal": "Verdelho",
                "createdAt": "2018-03-05T03:04:58.000Z",
                "updatedAt": "2018-03-05T03:04:58.000Z"
            },
            {
                "id": "733ba413-91b5-4a82-ab13-7d0d675b77b9",
                "type": "White",
                "varietal": "Vermentino",
                "createdAt": "2018-03-05T03:04:58.000Z",
                "updatedAt": "2018-03-05T03:04:58.000Z"
            },
            {
                "id": "eeb80a68-1166-4bcc-a23e-5f005fe88536",
                "type": "White",
                "varietal": "Viognier",
                "createdAt": "2018-03-05T03:04:58.000Z",
                "updatedAt": "2018-03-05T03:04:58.000Z"
            }
        ],
        "total": 79
    }
