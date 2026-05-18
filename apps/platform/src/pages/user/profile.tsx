import {
  CheckboxButtonContainer,
  FlexContainer,
  InputFieldContainer,
  LoadingSpinner,
  RadioButtonContainer,
  Section,
  SectionHeaderContainer,
  SelectInput,
  SEO,
  Text,
  Toast,
} from '@tbe/components';
import {
  COUNTRY_CODES,
  routes,
  USER_ROLE_OPTIONS,
  USER_USAGE_OPTIONS,
} from '@tbe/constants';
import { useUser, useUsername } from '@tbe/hooks';
import type { PageProps } from '@tbe/interface';
import {
  CACHE_TIMES,
  queryKeys,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tbe/query';
import {
  getPreFetchProps,
  mergeApiAndSessionProfileForm,
  sendRequest,
  type UserProfileFormFields,
  type UserProfileFormSource,
} from '@tbe/utils';
import { useRouter } from 'next/router';
import { Fragment, useEffect, useMemo, useState } from 'react';

/** Fields returned by GET /user that we show on this page (Mongoose user doc). */
interface ProfilePageApiUser extends UserProfileFormSource {
  name?: string;
  email?: string;
  image?: string;
}

const ProfilePage = ({ seoMeta }: PageProps) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, isAuth, loading: loadingUser, updateSession } = useUser();

  const [form, setForm] = useState<UserProfileFormFields>({
    userName: '',
    occupation: '',
    purpose: [],
    contactNo: '+91',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type?: 'success' | 'error';
  } | null>(null);

  const { data: profileResponse, isLoading: loadingProfile } = useQuery({
    queryKey: queryKeys.user.profile(user?.id ?? '__no_user__'),
    queryFn: () => {
      if (!user?.id) {
        throw new Error('User id required');
      }
      return sendRequest({
        url: `${routes.api.user}?userId=${encodeURIComponent(user.id)}`,
      });
    },
    ...CACHE_TIMES.STANDARD,
    enabled: Boolean(user?.id),
  });

  const profileRecord = profileResponse?.data as ProfilePageApiUser | undefined;

  const savedUserName = profileRecord?.userName ?? user?.userName ?? '';

  const displayName = profileRecord?.name ?? user?.name ?? 'User';
  const displayEmail = profileRecord?.email ?? user?.email ?? '';
  const displayImage = profileRecord?.image ?? user?.image;

  const resetFormFromSources = () => {
    if (!user?.id) return;
    setForm(mergeApiAndSessionProfileForm(profileRecord, user));
  };

  useEffect(() => {
    if (!user?.id) return;
    setForm(mergeApiAndSessionProfileForm(profileRecord, user));
  }, [user, profileRecord]);

  const saveMutation = useMutation({
    mutationFn: async (payload: UserProfileFormFields) => {
      const res = await sendRequest({
        url: `${routes.api.onboard}?userId=${encodeURIComponent(user!.id)}`,
        method: 'POST',
        body: payload,
      });
      if (!res.status) {
        throw new Error(
          typeof res.message === 'string' ? res.message : 'Update failed',
        );
      }
      return res;
    },
    onSuccess: async () => {
      if (user?.id) {
        await queryClient.invalidateQueries({
          queryKey: queryKeys.user.profile(user.id),
        });
      }
      await updateSession();
    },
  });

  const { message: usernameMessage, isUsernameAvailable } = useUsername(
    isEditing ? form.userName : '',
  );

  const contactParts = useMemo(() => {
    const raw = form.contactNo.trim();
    const [first = '+91', ...rest] = raw.split(/\s+/);
    const number = rest.join(' ');
    return { code: first, number };
  }, [form.contactNo]);

  const { code, number } = contactParts;

  if (loadingUser) return <LoadingSpinner />;
  if (!isAuth) {
    router.push(routes.login);
    return null;
  }

  if (loadingProfile) return <LoadingSpinner />;

  const updateForm = <K extends keyof UserProfileFormFields>(
    key: K,
    value: UserProfileFormFields[K],
  ) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    if (!user?.id || saveMutation.isPending) return;

    try {
      await saveMutation.mutateAsync({ ...form });
      setToast({
        message: 'Profile updated successfully!',
        type: 'success',
      });
      setIsEditing(false);
    } catch {
      setToast({
        message: 'Something went wrong. Please try again.',
        type: 'error',
      });
    }
  };

  const isFormValid = (): boolean => {
    if (!form.userName || form.userName.length < 3) return false;
    if (isEditing && form.userName !== savedUserName && !isUsernameAvailable)
      return false;
    if (!form.occupation) return false;
    if (!form.purpose.length) return false;
    return true;
  };

  const hasContactDigits = /\d/.test(form.contactNo);
  const codeList = COUNTRY_CODES.map((c) => c.code);

  const occupationLabel =
    USER_ROLE_OPTIONS.find((o) => o.value === form.occupation)?.label ||
    form.occupation;

  const purposeLabels = form.purpose
    .map((p) => USER_USAGE_OPTIONS.find((o) => o.value === p)?.label || p)
    .join(', ');

  return (
    <Fragment>
      <SEO seoMeta={seoMeta} />
      <Section className='md:py-4 px-2 py-2'>
        <FlexContainer
          className='max-w-3xl mx-auto bg-white rounded-2 border shadow-sm px-4 py-6 gap-6'
          direction='col'
        >
          <FlexContainer className='w-full justify-between items-center'>
            <SectionHeaderContainer
              heading='Your '
              focusText='Profile'
              headingLevel={4}
              subtext='View and update your preferences'
            />
            {!isEditing ? (
              <button
                className='px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:opacity-90 transition'
                onClick={() => setIsEditing(true)}
              >
                Edit
              </button>
            ) : (
              <FlexContainer className='gap-2'>
                <button
                  className='px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition'
                  onClick={() => {
                    setIsEditing(false);
                    resetFormFromSources();
                  }}
                >
                  Cancel
                </button>
                <button
                  className='px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:opacity-90 transition disabled:opacity-50'
                  disabled={!isFormValid() || saveMutation.isPending}
                  onClick={handleSave}
                >
                  {saveMutation.isPending ? 'Saving...' : 'Save'}
                </button>
              </FlexContainer>
            )}
          </FlexContainer>

          {/* User Info Header */}
          <FlexContainer className='gap-3 items-center'>
            {displayImage ? (
              <img
                alt={displayName}
                className='w-16 h-16 rounded-full object-cover border-2 border-gray-200'
                src={displayImage}
              />
            ) : (
              <div className='w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-xl font-semibold'>
                {displayName[0]?.toUpperCase() || 'U'}
              </div>
            )}
            <FlexContainer direction='col' className='gap-0.5'>
              <Text className='heading-5 font-semibold' level='h5'>
                {displayName}
              </Text>
              <Text className='text-sm text-gray-500' level='p'>
                {displayEmail}
              </Text>
            </FlexContainer>
          </FlexContainer>

          <div className='h-px w-full bg-gray-200' />

          {/* Preferences Section */}
          {isEditing ? (
            <FlexContainer className='gap-6' direction='col' fullWidth>
              {/* Username */}
              <FlexContainer className='gap-2 md:w-2/3 w-full' direction='col'>
                <Text className='paragraph font-medium' level='p'>
                  Username
                </Text>
                <InputFieldContainer
                  label='Username'
                  type='text'
                  value={form.userName}
                  onChange={(val) => updateForm('userName', val)}
                />
                {form.userName && form.userName !== savedUserName && (
                  <Text
                    className={`span text-sm ${
                      isUsernameAvailable ? 'text-success' : 'text-primary'
                    }`}
                    level='span'
                  >
                    {usernameMessage}
                  </Text>
                )}
              </FlexContainer>

              {/* Occupation */}
              <FlexContainer className='gap-2' direction='col'>
                <Text className='paragraph font-medium' level='p'>
                  What do you do?
                </Text>
                <RadioButtonContainer
                  options={USER_ROLE_OPTIONS}
                  selectedValue={form.occupation}
                  onChange={(val) => updateForm('occupation', val)}
                />
              </FlexContainer>

              {/* Purpose */}
              <FlexContainer className='gap-2' direction='col'>
                <Text className='paragraph font-medium' level='p'>
                  How do you use the Platform?
                </Text>
                <CheckboxButtonContainer
                  options={USER_USAGE_OPTIONS.map(({ label, value }) => ({
                    label,
                    value,
                  }))}
                  selectedValues={form.purpose}
                  onChange={(val) => updateForm('purpose', val)}
                />
              </FlexContainer>

              {/* Phone Number */}
              <FlexContainer className='gap-2' direction='col'>
                <Text className='paragraph font-medium' level='p'>
                  Contact Number
                </Text>
                <FlexContainer className='gap-2 w-full items-center flex-nowrap'>
                  <SelectInput
                    aria-label='Country Code'
                    list={codeList}
                    selectedItem={code}
                    onChange={(val) =>
                      updateForm('contactNo', `${val} ${number}`)
                    }
                  />
                  <InputFieldContainer
                    className='w-full'
                    isOptional
                    label='Phone Number'
                    labelClass='sr-only'
                    type='tel'
                    value={number}
                    onChange={(val) =>
                      updateForm('contactNo', `${code} ${val}`)
                    }
                  />
                </FlexContainer>
              </FlexContainer>
            </FlexContainer>
          ) : (
            <FlexContainer className='gap-4' direction='col' fullWidth>
              {/* Read-only display */}
              <FlexContainer className='gap-1' direction='col'>
                <Text className='text-sm text-gray-500' level='p'>
                  Username
                </Text>
                <Text className='paragraph font-medium' level='p'>
                  {form.userName || 'Not set'}
                </Text>
              </FlexContainer>

              <div className='h-px w-full bg-gray-100' />

              <FlexContainer className='gap-1' direction='col'>
                <Text className='text-sm text-gray-500' level='p'>
                  Occupation
                </Text>
                <Text className='paragraph font-medium' level='p'>
                  {occupationLabel || 'Not set'}
                </Text>
              </FlexContainer>

              <div className='h-px w-full bg-gray-100' />

              <FlexContainer className='gap-1' direction='col'>
                <Text className='text-sm text-gray-500' level='p'>
                  Platform Usage
                </Text>
                <Text className='paragraph font-medium' level='p'>
                  {purposeLabels || 'Not set'}
                </Text>
              </FlexContainer>

              <div className='h-px w-full bg-gray-100' />

              <FlexContainer className='gap-1' direction='col'>
                <Text className='text-sm text-gray-500' level='p'>
                  Contact Number
                </Text>
                <Text className='paragraph font-medium' level='p'>
                  {hasContactDigits ? form.contactNo : 'Not set'}
                </Text>
              </FlexContainer>
            </FlexContainer>
          )}
        </FlexContainer>
      </Section>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </Fragment>
  );
};

export const getServerSideProps = async () => ({
  ...(await getPreFetchProps({ slug: routes.user.profile })),
});

export default ProfilePage;
