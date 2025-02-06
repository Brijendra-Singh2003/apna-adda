#include <bits/stdc++.h>
using namespace std;

int main()
{
    int t;
    cin >> t;

    while (t--)
    {
        string a, b;
        cin >> a >> b;

        int n = a.size(), m = b.size();

        if (m > n)
        {
            cout << -1 << endl;
            continue;
        }

        unordered_map<char, vector<int>> mp;
        unordered_map<char, int> freqA, freqB;

        for (int i = 0; i < n; i++)
        {
            mp[a[i]].push_back(i + 1);
            freqA[a[i]]++;
        }

        for (char ch : b)
            freqB[ch]++;

        bool can = true;
        for (auto &[ch, count] : freqB)
        {
            if (freqA[ch] < count)
            {
                can = false;
                break;
            }
        }

        if (!can)
        {
            cout << -1 << endl;
            continue;
        }

        long long ans = 0;
        set<int> deletedInd;

        for (char i = 'a'; i <= 'z'; i++)
        {
            int diff = freqA[i] - freqB[i];

            if (diff > 0)
            {
                auto &Allind = mp[i]; // Get Allind of the iaracter

                for (int i = 0; i < diff; i++)
                {
                    int removeIndex = Allind[i]; // Get the index to remove

                    int temp = removeIndex - distance(deletedInd.begin(), deletedInd.lower_bound(removeIndex));
                    ans += temp;

                    deletedInd.insert(removeIndex); // Mark as removed
                }
            }
        }

        cout << ans << endl;
    }

    return 0;
}
