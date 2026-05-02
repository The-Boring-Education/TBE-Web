import {
  CheckboxButtonContainer,
  FlexContainer,
  InputFieldContainer,
  LoadingSpinner,
  OnboardingLayout,
  RadioButtonContainer,
  Section,
  SectionHeaderContainer,
  SEO,
  SelectInput,
  Text,
  Toast,
} from '@tbe/components';
import {
  COUNTRY_CODES,
  routes,
  USER_ROLE_OPTIONS,
  USER_USAGE_OPTIONS,
} from '@tbe/constants';
import { useApi, useUser, useUsername } from '@tbe/hooks';
import type { PageProps } from '@tbe/interface';
import { getPreFetchProps } from '@tbe/utils';
import { useRouter } from 'next/router';
import { Fragment, useEffect, useState } from 'react';

const ProfilePage = ({ seoMeta }: PageProps) => {
  const router = useRouter();
  const { user, isAuth, loading: loadingUser, updateSession } = useUser();
  const { makeRequest } = useApi('profile');

  const [form, setForm] = useState({
    userName: '',
    occupation: '',
    purpose: [] as string[],
    contactNo: '+91',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type?: 'success' | 'error';
  } | null>(null);

  const { message: usernameMessage, isUsernameAvailable } = useUsername(
    isEditing ? form.userName : '',
  );

  // Prefill form from user session data
  useEffect(() => {
    if (user) {
      setForm({
        userName: user.userName || '',
        occupation: user.occupation || '',
        purpose: user.purpose || [],
        contactNo: user.contactNo || '+91',
      });
    }
  }, [user]);

  if (loadingUser) return <LoadingSpinner />;
  if (!isAuth) {
    router.push(routes.login);
    return null;
  }

  const updateForm = (key: keyof typeof form, value: any) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    if (!user?.id || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const payload = { ...form };
      const { status } = await makeRequest({
        url: `${routes.api.onboard}?userId=${user.id}`,
        method: 'POST',
        body: payload,
      });

      if (status) {
        setToast({
          message: 'Profile updated successfully!',
          type: 'success',
        });
        await updateSession();
        setIsEditing(false);
      }
    } catch {
      setToast({
        message: 'Something went wrong. Please try again.',
        type: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = (): boolean => {
    if (!form.userName || form.userName.length < 3) return false;
    if (isEditing && form.userName !== user?.userName && !isUsernameAvailable)
      return false;
    if (!form.occupation) return false;
    if (!form.purpose.length) return false;
    return true;
  };

  const [code = '+91', number = ''] = form.contactNo.split(' ');
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
                    // Reset form to user data
                    if (user) {
                      setForm({
                        userName: user.userName || '',
                        occupation: user.occupation || '',
                        purpose: user.purpose || [],
                        contactNo: user.contactNo || '+91',
                      });
                    }
                  }}
                >
                  Cancel
                </button>
                <button
                  className='px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:opacity-90 transition disabled:opacity-50'
                  disabled={!isFormValid() || isSubmitting}
                  onClick={handleSave}
                >
                  {isSubmitting ? 'Saving...' : 'Save'}
                </button>
              </FlexContainer>
            )}
          </FlexContainer>

          {/* User Info Header */}
          <FlexContainer className='gap-3 items-center'>
            {user?.image ? (
              <img
                alt={user?.name || 'User'}
                className='w-16 h-16 rounded-full object-cover border-2 border-gray-200'
                src={user.image}
              />
            ) : (
              <div className='w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-xl font-semibold'>
                {user?.name?.[0]?.toUpperCase() || 'U'}
              </div>
            )}
            <FlexContainer direction='col' className='gap-0.5'>
              <Text className='heading-5 font-semibold' level='h5'>
                {user?.name || 'User'}
              </Text>
              <Text className='text-sm text-gray-500' level='p'>
                {user?.email || ''}
              </Text>
            </FlexContainer>
          </FlexContainer>

          <div className='h-px w-full bg-gray-200' />

          {/* Preferences Section */}
          {isEditing ? (
            <FlexContainer className='gap-6' direction='col' fullWidth>
              {/* Username */}
              <FlexContainer
                className='gap-2 md:w-2/3 w-full'
                direction='col'
              >
                <Text className='paragraph font-medium' level='p'>
                  Username
                </Text>
                <InputFieldContainer
                  label='Username'
                  type='text'
                  value={form.userName}
                  onChange={(val) => updateForm('userName', val)}
                />
                {form.userName && form.userName !== user?.userName && (
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
                    onChange={(val) => updateForm('contactNo', `${code} ${val}`)}
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
                  {form.contactNo && form.contactNo !== '+91'
                    ? form.contactNo
                    : 'Not set'}
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
