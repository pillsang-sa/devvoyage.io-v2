---
title: React Hook Form & Zod으로 유연하게 폼 관리하기
summary: Form UI를 제작하면서 React Hook Form과 Zod를 사용하여 Form을 유연하게 다뤘던 내용을 소개합니다.
publishedAt: 2024-04-03
---

## TL;DR

프론트엔드 업무를 할 때 한 번쯤은 꼭 만들어야 하는 UI 중의 하나는 Form UI라고 할 수 있을 것 같습니다. React의 Hook인 useState로 복잡한 상태관리, 유효성 검사 로직이 포함된 Form UI를 만들었습니다. 결과물을 보고 지금보다 직관적이고 수정이 용이한 코드로 변경하고 싶은 마음에 **React Hook Form**(이하 RHF)와 **Zod** 라이브러리 도입을 결정했습니다. 해당 게시글에서는 RHF & Zod로 변환하는 과정은 다루지 않고, RHF & Zod를 사용해서 구현한 Form UI를 예시 코드와 함께 설명하겠습니다.

## 라이브러리 소개

### React Hook Form

React Hook Form은 React에서 사용할 수 있는 라이브러리로, 폼을 더 효율적으로 관리할 수 있게 해 줍니다. 주로 사용성과 성능을 개선하기 위해 설계되었으며, 기존의 폼 상태 관리 라이브러리들에 비해 간단하고 빠른 성능을 제공합니다. 여기에는 몇 가지 핵심적인 특징들이 있습니다.

- Form에서 입력되는 값을 DOM에서 관리할 수 있습니다. 비제어 컴포넌트라고 하며 불필요한 리 렌더링을 최소화할 수 있습니다. 또한 비제어 컴포넌트를 사용하기 어려운 경우(ex. 라이브러리 사용) 제어 컴포넌트를 통한 Form 관리 방법도 제공합니다.
- zod, yup과 같은 유효성 검사 라이브러리와의 통합을 지원하여, 더 직관적인 유효성 검사 로직을 구현할 수 있습니다.
- 타입스크립트를 지원합니다.

[React Hook Form - Documentation](https://react-hook-form.com)

### Zod

Zod는 타입스크립트 기반의 스키마 선언과 유효성 검사를 위한 라이브러리로, 데이터의 구조와 유효성을 정의하고, 런타임에서 이를 검증할 수 있습니다. 주로 API 스키마 검증, Form 데이터 유효성 검사 등에 사용됩니다.

[Zod - Documentation](https://zod.dev)

## useForm

**useForm**은 input을 비제어 컴포넌트로서 제어하기 위한 핵심 역할을 하는 커스텀 훅입니다.

```tsx
export interface SignUpFormData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  consentCheckbox: boolean;
}

function ReactHookFormsWithZodIsland() {
  const {
    register,
    unregister,
    formState,
    watch,
    handleSubmit,
    reset,
    resetField,
    setError,
    clearErrors,
    setValue,
    setFocus,
    getValues,
    getFieldState,
    trigger,
    control,
  } = useForm<SignUpFormData>({
    mode: 'onChange',
    resolver: zodResolver(Schema),
    defaultValues: undefined,
  });
}
```

React 컴포넌트 내부의 useForm 코드입니다. useForm의 객체 내부에 다양한 메서드가 있으며, 일부 메서드 사용 예시는 아래에서 보여드리겠습니다. 그리고 객체 타입을 생성 후 제네릭으로 useForm에 타입을 지정했습니다. Props로는 원래 10가지가 존재하지만 자주 사용했던 3가지만 설명하겠습니다.

- **mode** : onChange | onBlur | onSubmit | onTouched | all = 'onSubmit'을 지원합니다. Form submit이 동작하기 이전에 유효성 검사 방식 설정이 가능한 prop입니다.
- **resolver**: 위에서 설명했듯이 RHF는 다른 유효성 검사 라이브러리와의 통합을 지원합니다. resolver로 통합이 가능하며, 위에서는 **@hookform/resolvers/zod** 라이브러리를 추가 후 zodResolver를 사용해 미리 zod로 생성해 둔 타입 스키마와 연결해 두었습니다.
- **defaultValues**: Form values 대한 기본 값 설정이 가능합니다. 이번 예제에서는 회원가입을 구현하였기에 필요가 없지만 회원정보 수정 등 데이터가 준비되어 있어야 하는 Form인 경우 해당 prop을 사용하니 유용했습니다. 하지만 회원가입 같은 경우에도 안전하게 기본값을 설정하는 것을 많이 보았습니다. 별개로 기본값이 api를 사용해서 받아오는 경우에는 아래와 같은 패턴을 추천해 드립니다. (자세한 내용은 [여기](https://react-hook-form.com/docs/useform)에서 확인할 수 있습니다.)

```tsx
function App() {
  const values = useFetch('/api');
  useForm({
    defaultValues: {
      firstName: '',
      lastName: '',
    },
    values, // will get updated once values returns
  });
}
```

## 비제어 컴포넌트(Uncontrolled Components)

```tsx
<TextField
  label="Email"
  required
  isError={!!formState.errors.email}
  errorMessage={formState.errors.email?.message}
  type="email"
  placeholder="Email"
  {...register('email')}
/>;

const TextField = React.forwardRef(
  (
    { label, required, isError, errorMessage, ...rest }: TextFieldProps,
    ref: React.ForwardedRef<HTMLInputElement>,
  ) => (
    <div className="flex w-full flex-col gap-1">
      <label htmlFor={rest.name}>
        {label}
        {required ? <strong className="pl-1 text-red-700">*</strong> : <></>}
      </label>
      <input
        id={rest.name}
        {...rest}
        className={FormatLib.cn(
          isError ? 'border-[1px] border-solid border-red-700' : '',
          'rounded-sm p-[10px]',
        )}
      />
      {isError ? (
        <span className="text-xs text-red-700">{errorMessage}</span>
      ) : (
        <></>
      )}
    </div>
  ),
);
```

style이 중복되어 TextField라는 컴포넌트로 추상화 해보았고, register를 구조 분해 할당하면 아래와 같습니다.

```tsx
const { onChange, onBlur, name, ref } = register('email');
```

여기서 비제어 컴포넌트로 사용하기 위한 핵심 부분은 name과 ref입니다. ref를 통해 DOM에서 input에 대한 관리가 가능하고, name을 통해 에러핸들링, 필드 초기화 등이 가능하기 때문입니다. 두 가지의 return 값을 사용해 우리가 평소 사용하던 비제어 컴포넌트 구현이 가능합니다. onChange와 onBlur의 경우는 기획 / 디자인 요구사항이 있을 때 주로 사용했던 것 같습니다.

## Schema

```tsx
const Schema = z
  .object({
    email: z.string().email({ message: 'Invalid email.' }),
    password: z
      .string()
      .min(8, { message: 'Must be 8 or more characters long.' })
      .max(16, { message: 'Must be 16 or fewer characters long.' })
      .regex(
        /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*()_+{}\[\]:;<>,.?\/~`-]).*$/,
        { message: 'Invalid password.' },
      ),
    confirmPassword: z
      .string()
      .min(8, { message: 'Must be 8 or more characters long.' })
      .max(16, { message: 'Must be 16 or fewer characters long.' })
      .regex(
        /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*()_+{}\[\]:;<>,.?\/~`-]).*$/,
        { message: 'Invalid password.' },
      ),
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    phoneNumber: z.string(),
    consentCheckbox: z.boolean(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });
```

zod를 통해 작성한 타입 스키마입니다. 위에서 resolver prop을 사용해 RHF와 유효성 검사 라이브러리가 통합되는 내용을 설명해 드렸습니다. 해당 부분에서 사용된 스키마가 위의 코드입니다. z에서 제공하는 property를 사용하여 스키마를 작성하게 되며 typescript와 매우 유사합니다. 다만 다른 점이 있다면 유효성을 검사하는 부분입니다. 메서드 체이닝을 사용해 유효성 로직을 매우 직관적이고 명확하게 지정이 가능해 사용감이 좋습니다. 기획의 변경 사항이 있을 때 한곳에 모아져 있다 보니 수정하기에 매우 용이했습니다.

추가로 refine에 대해서는 짚고 넘어가 보겠습니다. refine의 뜻을 해석하면,

> Remove impurities or unwanted elements from (a substance), typically as part of an industrial process.
>
> 일반적으로 산업 공정의 일부로 (물질)에서 불순물이나 원치 않는 요소를 제거합니다.

refine의 실제 의미와 zod에서의 의미가 크게 관련이 있는지는 모르겠습니다. zod에서는 커스텀 유효성 검사를 해야할 때 사용합니다. 위에서는 password 필드와 confirmPassword의 일치 여부 유효성 검사에 대해 refine을 사용했습니다.

## FormState

```tsx
const isButtonDisabled = !formState.isDirty || !formState.isValid;

return (
  <button
    form="signUpForm"
    disabled={isButtonDisabled}
    className="w-full rounded-xl bg-blue-400 py-[10px] text-white transition-colors hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-gray-400"
  >
    Submit
  </button>
);
```

여러 가지 Form UI를 경험했던 기억으로 유효성 검사 또는 필수 입력 필드가 만족하지 않았을 때는 submit을 하는 버튼이 활성화되지 않았습니다. 앞선 기능을 구현하기 위해서는 RHF의 formState의 isDirty와 isValid가 좋은 선택일 수 있습니다. 정의는 아래와 같습니다.

- **isDirty**: 기본값은 false이며, 유저가 하나의 input이라도 변경하면 true로 변경됨.
- **isValid**: 기본값은 false이며, Form에 에러가 하나도 없는 경우 true로 변경됨.

위 값들을 사용해 사용자가 한 번이라도 input을 조작하고 zod 스키마(resolver)로 구현한 유효성 검사 로직을 만족할 때만 버튼을 enable 상태로 변경이 가능합니다. 이 부분은 직접 콘솔을 보면서 확인하면 좋을 것 같아 useEffect를 사용해서 console.log로 isDirty와 isValid 값을 볼 수 있게 구현해 두었습니다.

## Conclusion

RHF와 Zod를 사용해 Form UI를 유연하게 관리하는 방법을 소개해 드렸습니다. 저는 위 로직을 Form UI 제작할 때 boilerPlate로 두고 디자인 & 기획 요구사항에 맞춰 개념을 확장하는 방식으로 사용 중입니다. 그리고 RHF에서는 useForm을 제외하고도 제어 컴포넌트(타 UI 라이브러리 등)를 다룰 때 사용하기 좋은 **Controller**, 다중 Form을 제어할 때 좋은 **useFieldArray** 등이 있습니다. Zod 또한 API응답 객체를 파싱할 때 사용하여 type-safe하게 사용했던 기억이 있습니다. Form UI 작업이 아니더라도 두 가지 라이브러리를 적재적소에 잘 사용하면 좋은 DX를 가져갈 수 있지 않을까 기대해 봅니다..!
