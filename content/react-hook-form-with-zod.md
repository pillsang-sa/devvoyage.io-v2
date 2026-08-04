---
title: React Hook Form & Zod으로 유연하게 폼 관리하기
summary: useState로 쌓아 올린 폼 상태와 검증 로직을 걷어내고, 비제어 입력은 RHF에, 규칙은 zod 스키마 한 곳에 몰아넣었습니다.
publishedAt: 2024-04-03
---

프론트엔드를 하다 보면 폼은 반드시 한 번은 만들게 됩니다. 처음에는 `useState`로 값과 에러를 들고 검증 로직을 직접 붙여 만들었는데, 필드가 늘어날수록 상태 선언과 조건문이 같이 늘어났습니다. 기획이 조금 바뀌면 고쳐야 할 곳이 여기저기 흩어져 있었습니다.

**React Hook Form**(이하 RHF)과 **zod**로 옮기면서 정리된 건 두 가지입니다. 입력값은 DOM이 들고 있게 하고, 검증 규칙은 스키마 한 곳에 모읍니다.

| | 역할 |
| --- | --- |
| React Hook Form | 비제어 입력 등록, 폼 상태 추적, 제출 처리 |
| zod | 타입 스키마 선언과 런타임 검증 |
| @hookform/resolvers | 둘을 이어주는 어댑터 |

RHF은 입력값을 DOM에서 관리하는 비제어 방식이 기본이라 불필요한 리렌더가 적습니다. 외부 UI 라이브러리처럼 비제어로 다루기 어려운 경우를 위한 제어 방식도 함께 제공합니다.

## useForm

`useForm`이 폼 하나를 통째로 관장합니다. 제네릭으로 폼 값의 타입을 넘기면 이후 모든 메서드가 그 타입을 따라갑니다.

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

function ReactHookFormWithZodExample() {
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

옵션은 열 가지가 넘지만 실제로 자주 만진 건 셋입니다.

`mode`는 제출 전에 언제 검증할지를 정합니다. 기본값 `onSubmit` 외에 `onChange`, `onBlur`, `onTouched`, `all`을 쓸 수 있습니다.

`resolver`는 외부 검증 라이브러리를 연결하는 자리입니다. `@hookform/resolvers/zod`의 `zodResolver`에 미리 만들어 둔 스키마를 넘기면 됩니다.

`defaultValues`는 초기값입니다. 회원가입에는 없어도 그만이지만 회원정보 수정처럼 기존 데이터를 채워야 하는 폼에서는 필수입니다. 그 값을 API로 받아온다면 `defaultValues` 대신 `values`를 쓰는 편이 낫습니다. 응답이 도착한 시점에 폼이 알아서 갱신됩니다.

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

## register가 하는 일

입력 필드는 `register`가 돌려주는 것들을 펼쳐 넣기만 하면 등록됩니다. 스타일이 반복돼서 `TextField`로 한 번 감쌌습니다.

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

펼쳐 넣은 값은 네 개입니다.

```tsx
const { onChange, onBlur, name, ref } = register('email');
```

핵심은 `ref`와 `name`입니다. `ref`로 DOM의 입력 엘리먼트를 직접 잡아 비제어로 다루고, `name`이 에러 조회나 필드 초기화의 키가 됩니다. `onChange`와 `onBlur`는 기획이나 디자인 요구사항이 있을 때만 따로 꺼내 썼습니다.

## 규칙은 스키마 한 곳에

zod 스키마는 타입 선언처럼 읽히면서 검증 규칙까지 같이 담습니다. 메서드 체이닝이라 조건이 붙어도 흐름이 끊기지 않고, 무엇보다 기획이 바뀌었을 때 고칠 곳이 한 파일입니다.

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

마지막의 `refine`은 커스텀 검증을 붙이는 자리입니다. 단일 필드로는 판단할 수 없는 규칙, 여기서는 비밀번호와 확인란이 일치하는지를 여기서 봅니다. `path`로 어느 필드에 에러를 달지 지정할 수 있습니다.

## 제출 버튼은 언제 열리는가

필수 입력이 안 찼거나 검증에 걸리면 제출 버튼이 잠겨 있어야 합니다. `formState`의 두 값이면 충분합니다.

`isDirty`는 사용자가 입력을 한 번이라도 건드리면 `true`가 되고, `isValid`는 폼에 에러가 하나도 없을 때 `true`가 됩니다. 둘 다 만족할 때만 버튼을 엽니다.

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

이 정도가 폼 하나를 만드는 최소 구성입니다. 저는 여기까지를 보일러플레이트로 두고 요구사항에 따라 확장하는 식으로 씁니다. 외부 UI 라이브러리를 제어 컴포넌트로 붙일 때는 `Controller`, 항목이 늘었다 줄었다 하는 폼에는 `useFieldArray`가 있습니다. zod는 폼 밖에서도 쓸모가 있어서, API 응답을 파싱해 타입을 보장하는 데도 잘 맞았습니다.

- [React Hook Form](https://react-hook-form.com)
- [Zod](https://zod.dev)
