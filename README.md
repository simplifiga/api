# Simplifiga API
A Simplifiga é uma plataforma de gerenciamento com foco na simplicidade e eficiência. Com nossa API seus links são facilmente encurtados tornando-os curtos e memoráveis com a opção de apelido personalizável... [(documentação completa)](https://simplifi.ga/developer)

## Novidades

- Criptografia RSA com suporte a chaves de 1024 bits;
- Possível excluir pontes de redirecionamento;
- Possível atualizar pontes de redirecionamento (ID e TARGET);
- Filtro e seleção de dados;
- Erros mapeados e controlados;
- Chaves de autenticação dentro de Headers.

## Utilização

- Token de autorização. [Registre-se aqui](https://simplifi.ga/register);
- Endpoint: [https://simplifiga-api.herokuapp.com/](https://simplifiga-api.herokuapp.com/)
- Documentação: [https://simplifi.ga/developer](https://simplifi.ga/developer)

```js
>>>>> Request

fetch('https://simplifiga-api.herokuapp.com/', {
      method: 'POST',
      
      headers: {
        authorization: {TOKEN}
      }
      
      body: JSON.stringify({
        url: {YOUR_URL},
        id?: {CUSTOM_ID}
      })
})

<<<<< Response

{
    id: "example",
    target: "https://example.url/?longUrlExampleParameterKey=longparametervalue",
    shortcut: "https://simplifi.ga/example"
}

```
